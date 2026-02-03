#!/usr/bin/env node
// scripts/ios-launcher.mjs
// Launches iOS app with automatic simulator detection

import { spawn } from "node:child_process";
import { detectAndBootSimulator } from "./detect-sim.mjs";

async function launchIOS() {
  try {
    // Detect and boot the best simulator
     const simulator = detectAndBootSimulator();
 
    // Launch the app with react-native CLI
     const child = spawn("npx", ["react-native", "run-ios", "--udid", simulator.udid], {
      stdio: "inherit",
      shell: true
    });

    child.on("error", (error) => {
       process.exit(1);
    });

    child.on("exit", (code) => {
      process.exit(code || 0);
    });
  } catch (error) {
     process.exit(1);
  }
}

launchIOS();