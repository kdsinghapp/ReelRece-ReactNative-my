// scripts/ios-autofix.mjs
// Node 18+
// Usage: npm run ios:auto-fix
// Iteratively builds iOS, asks Claude (Anthropic) for unified diffs to fix failures,
// applies patches, re-runs pods when needed, and repeats up to N attempts.

import { spawn } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, readFile, rm, mkdtemp, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import simpleGit from "simple-git";
import Anthropic from "@anthropic-ai/sdk";
import { detectAndBootSimulator } from "./detect-sim.mjs";

const git = simpleGit();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ---------- Config ----------
const MAX_ATTEMPTS = 5;
const WORKSPACE = "ios/ReelRece.xcworkspace";
const SCHEME = "ReelRece";
const SHOULD_OPEN_XCODE_ON_LAST_FAIL = false; // set true if you want it to open Xcode
const MAX_LOG_CHARS = 120_000; // trim huge logs; keep most-relevant tail
const MODEL = "claude-sonnet-4-5-20250929";

// Allow-list of files/dirs Claude may touch
const PATCH_ALLOWLIST = [
  "^ios/Podfile$",
  "^ios/.*\\.xcconfig$",
  "^ios/.*\\.pbxproj$",
  "^ios/.*\\.plist$",
  "^ios/.*",
  "^babel\\.config\\.js$",
  "^package\\.json$",
  "^index\\.js$",
  "^App\\.(js|tsx?)$",
  "^src/.*",
  "^react-native\\.config\\.js$",
  "^tsconfig\\.json$",
  "^\\.eslintrc\\.js$",
];

// ---------- Helpers ----------
function run(cmd, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
      ...options,
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("close", (code) => resolve({ code, out, err }));
  });
}

function redactSecrets(s) {
  return s
    .replace(/sk-[a-zA-Z0-9]{20,}/g, "sk-REDACTED")
    .replace(/(Authorization:\s*Bearer\s+)[^\s]+/gi, "$1REDACTED")
    .replace(/(ANTHROPIC_API_KEY=)[^\s]+/g, "$1REDACTED");
}

async function buildIOS(simulator) {
  // Build using the specific simulator UDID
  const destination = `platform=iOS Simulator,id=${simulator.udid}`;
 
  return await run("xcodebuild", [
    "-workspace",
    WORKSPACE,
    "-scheme",
    SCHEME,
    "-configuration",
    "Debug",
    "-destination",
    destination,
    "build",
  ]);
}

async function buildWithReactNative(simulator) {
  // Alternative: use react-native CLI with UDID
   return await run("npx", [
    "react-native",
    "run-ios",
    "--udid",
    simulator.udid,
  ]);
}

async function podInstallIfNeeded(diffText) {
  // If Podfile or Xcode project changed, run pod install
  const touched = ["ios/Podfile", "ios/Podfile.lock", "ios/Pods", ".xcworkspace", ".xcodeproj"];
  if (touched.some((t) => diffText.includes(t))) {
     const res = await run("bash", ["-lc", "cd ios && pod install"]);
    if (res.code !== 0) {
       
       throw new Error("pod install failed");
    }
  }
}

function patchTouchesOnlyAllowlisted(diffText) {
  // quick filter: only permit diffs whose file paths match allow-list
  const fileLines = diffText
    .split("\n")
    .filter((l) => l.startsWith("--- ") || l.startsWith("+++ "));
  const pathRegexes = PATCH_ALLOWLIST.map((r) => new RegExp(r));

  for (const line of fileLines) {
    // lines look like: --- a/ios/Podfile  or +++ b/src/foo.ts
    const m = line.match(/^[+-]{3}\s+[ab]\/(.+)\s*$/);
    if (!m) continue;
    const p = m[1].trim();
    const ok = pathRegexes.some((rx) => rx.test(p));
    if (!ok) {
      return { ok: false, offending: p };
    }
  }
  return { ok: true };
}

async function applyPatch(diffText) {
  // Save patches for debugging
  await mkdir("tmp", { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:]/g, "-").split(".")[0];
  const patchPath = join("tmp", `patch-${timestamp}.diff`);
  await writeFile(patchPath, diffText, "utf8");
 
  // Validate patch format
  if (!diffText.includes("---") || !diffText.includes("+++")) {
     throw new Error("Invalid patch format");
  }

  // Clean up patch text (sometimes Claude adds extra whitespace or formatting)
  const cleanedPatch = diffText
    .replace(/\r\n/g, "\n")  // Normalize line endings
    .replace(/^\s+$/gm, "")  // Remove lines with only whitespace
    .trim() + "\n";  // Ensure trailing newline

  // Write cleaned patch
  const cleanPatchPath = join("tmp", `patch-${timestamp}-clean.diff`);
  await writeFile(cleanPatchPath, cleanedPatch, "utf8");

  // Try different git apply strategies
  let res = await run("git", ["apply", "--check", cleanPatchPath]);
  if (res.code === 0) {
    // Patch looks good, apply it
    res = await run("git", ["apply", "--whitespace=fix", cleanPatchPath]);
  } else {
    // Try with -p1 (strip one directory level)
    res = await run("git", ["apply", "--check", "-p1", cleanPatchPath]);
    if (res.code === 0) {
      res = await run("git", ["apply", "-p1", "--whitespace=fix", cleanPatchPath]);
    }
  }

  if (res.code !== 0) {
     throw new Error("git apply failed");
  }

  await git.add(["-A"]);
  await git.commit("chore(autofix): apply Claude patch for iOS build");
}

async function repoSnapshot() {
  const status = await git.status();
  const changed = status.files.map((f) => `${f.working_tree || f.index} ${f.path}`).join("\n");
  const head = await git.revparse(["--short", "HEAD"]);
  const files = await run("bash", ["-lc", "git ls-files | wc -l"]);
  const tsconfig = await safeRead("tsconfig.json");
  const podfile = await safeRead("ios/Podfile");
  const babel = await safeRead("babel.config.js");
  const pkg = await safeRead("package.json");
  const rnConfig = await safeRead("react-native.config.js");

  return [
    `HEAD: ${head.trim()}`,
    `Changed files:\n${changed || "(none)"}`,
    `Repo file count: ${(files.out || "").trim()}`,
    `--- package.json ---\n${pkg}`,
    `--- tsconfig.json ---\n${tsconfig}`,
    `--- babel.config.js ---\n${babel}`,
    `--- react-native.config.js ---\n${rnConfig}`,
    `--- ios/Podfile ---\n${podfile}`,
  ].join("\n\n");
}

async function safeRead(path) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return "(missing)";
  }
}

function claudeSystemPrompt() {
  return `
You are an expert React Native iOS build engineer. Your sole job is to return a VALID unified diff (patch) that fixes the iOS build failure with the fewest, safest changes.

Rules:
- Return ONLY a unified diff (no backticks, no prose).
- Keep changes minimal and surgical.
- Prefer OLD ARCH (Fabric/new arch OFF) for RN 0.77 unless explicitly requested.
- If you change iOS config (Podfile, .pbxproj, .xcconfig, Info.plist), ensure settings are consistent with old arch, Hermes ON is okay.
- Do NOT delete code wholesale. Do NOT add random deps.
- Keep imports and paths correct.
- If a file doesn't exist, include it in the diff with correct path.
- Only modify files in this allow-list:
${PATCH_ALLOWLIST.map((r) => `  - ${r}`).join("\n")}
`;
}

function claudeUserPrompt({ buildLog, snapshot }) {
  return `
The iOS build failed. Provide a unified diff to fix it. If nothing to fix in code/config, return an empty diff that changes nothing.

===== BUILD LOG (tail, redacted) =====
${buildLog}

===== REPO SNAPSHOT =====
${snapshot}
`;
}

// Trim logs to last MAX_LOG_CHARS, which usually holds the meaningful errors.
function tail(str, limit) {
  if (!str) return "";
  return str.length <= limit ? str : str.slice(-limit);
}

// ---------- Main ----------
async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
     process.exit(1);
  }

 
  // Detect and boot simulator once at the start
  const simulator = detectAndBootSimulator();
 
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    

    const build = await buildIOS(simulator);

    if (build.code === 0) {
       return;
    }

    const combined = redactSecrets(`${build.out}\n\n${build.err}`);
    const logTail = tail(combined, MAX_LOG_CHARS);
 
    const snapshot = await repoSnapshot();

    // Ask Claude for a patch
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      temperature: 0,
      system: claudeSystemPrompt(),
      messages: [
        {
          role: "user",
          content: claudeUserPrompt({ buildLog: logTail, snapshot }),
        },
      ],
    });

    const content = msg.content?.map((c) => ("text" in c ? c.text : "")).join("") ?? "";
    const patch = content.trim();

    if (!patch) {
       break;
    }

    // Sometimes Claude wraps patches in markdown code blocks
    let cleanPatch = patch;
    if (patch.includes("```diff")) {
      const match = patch.match(/```diff\n([\s\S]*?)\n```/);
      if (match) {
        cleanPatch = match[1];
      }
    } else if (patch.includes("```")) {
      const match = patch.match(/```\n([\s\S]*?)\n```/);
      if (match) {
        cleanPatch = match[1];
      }
    }

    if (!cleanPatch.startsWith("--- ") && !cleanPatch.includes("\n--- ")) {
       break;
    }

    const allow = patchTouchesOnlyAllowlisted(cleanPatch);
    if (!allow.ok) {
 
      break;
    }

    try {
      await applyPatch(cleanPatch);
      await podInstallIfNeeded(cleanPatch);
     } catch (err) {
       break;
    }
  }

   if (SHOULD_OPEN_XCODE_ON_LAST_FAIL) {
     await run("open", [WORKSPACE]);
  }
  process.exit(1);
}

main().catch((e) => {
   process.exit(1);
});
