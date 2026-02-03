# Scripts Directory

Utility scripts for the ReelRecs project.

## Available Scripts

### `migrate-imports.js`

Automatically converts deep relative imports to path aliases.

#### Usage

```bash
# Single file
node scripts/migrate-imports.js src/screen/BottomTab/home/HomeScreen.tsx

# Entire directory
node scripts/migrate-imports.js src/screen/BottomTab/

# Multiple paths
node scripts/migrate-imports.js src/component/modal/ src/component/common/
```

#### What it does

Converts imports like:
```typescript
from '../../../../redux/store'
```

To:
```typescript
from '@redux/store'
```

#### Safety

⚠️ **This script modifies files in place!**

**Before running:**
1. Commit your changes: `git add . && git commit -m "Before import migration"`
2. Or create a backup
3. Review changes after: `git diff`

#### After Migration

1. Clear Metro cache: `npm start -- --reset-cache`
2. Test the app builds and runs
3. Commit changes if everything works

---

### Other Scripts

#### `ios-launcher.mjs`
Launches iOS simulator for development.

#### `ios-autofix.mjs`
Fixes common iOS build issues.

#### `detect-sim.mjs`
Detects available iOS simulators.

---

## Path Aliases Reference

| Alias | Maps To |
|-------|---------|
| `@components/*` | `src/component/*` |
| `@screens/*` | `src/screen/*` |
| `@redux/*` | `src/redux/*` |
| `@utils/*` | `src/utils/*` |
| `@assets/*` | `src/assets/*` |
| `@theme/*` | `src/theme/*` |
| `@types/*` | `src/types/*` |
| `@hooks/*` | `src/hook/*` |
| `@navigators/*` | `src/navigators/*` |
| `@services/*` | `src/services/*` |
| `@routes/*` | `src/routes/*` |

See `docs/PATH_ALIASES_GUIDE.md` for full documentation.
