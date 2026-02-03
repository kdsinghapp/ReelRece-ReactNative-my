#!/usr/bin/env node

/**
 * Import Migration Script v2 (Enhanced)
 * 
 * Converts deep relative imports to path aliases
 * NOW INCLUDES: Index imports (without trailing slash)
 * 
 * Usage:
 *   node scripts/migrate-imports-v2.js src/screen/
 */

const fs = require('fs');
const path = require('path');

// Define import replacements (with AND without trailing slash)
const replacements = [
  // ===== WITH TRAILING SLASH =====
  // 6+ levels
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/redux\//g, replacement: "from '@redux/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/component\//g, replacement: "from '@components/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/screen\//g, replacement: "from '@screens/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/utils\//g, replacement: "from '@utils/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/theme\//g, replacement: "from '@theme/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/assets\//g, replacement: "from '@assets/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/types\//g, replacement: "from '@types/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/hook\//g, replacement: "from '@hooks/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/navigators\//g, replacement: "from '@navigators/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/services\//g, replacement: "from '@services/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/routes\//g, replacement: "from '@routes/" },

  // 5 levels
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/redux\//g, replacement: "from '@redux/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/component\//g, replacement: "from '@components/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/screen\//g, replacement: "from '@screens/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/utils\//g, replacement: "from '@utils/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/theme\//g, replacement: "from '@theme/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/assets\//g, replacement: "from '@assets/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/types\//g, replacement: "from '@types/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/hook\//g, replacement: "from '@hooks/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/navigators\//g, replacement: "from '@navigators/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/services\//g, replacement: "from '@services/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/routes\//g, replacement: "from '@routes/" },

  // 4 levels
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/redux\//g, replacement: "from '@redux/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/component\//g, replacement: "from '@components/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/screen\//g, replacement: "from '@screens/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/utils\//g, replacement: "from '@utils/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/theme\//g, replacement: "from '@theme/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/assets\//g, replacement: "from '@assets/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/types\//g, replacement: "from '@types/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/hook\//g, replacement: "from '@hooks/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/navigators\//g, replacement: "from '@navigators/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/services\//g, replacement: "from '@services/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/routes\//g, replacement: "from '@routes/" },

  // 3 levels
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/redux\//g, replacement: "from '@redux/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/component\//g, replacement: "from '@components/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/screen\//g, replacement: "from '@screens/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/utils\//g, replacement: "from '@utils/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/theme\//g, replacement: "from '@theme/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/assets\//g, replacement: "from '@assets/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/types\//g, replacement: "from '@types/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/hook\//g, replacement: "from '@hooks/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/navigators\//g, replacement: "from '@navigators/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/services\//g, replacement: "from '@services/" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/routes\//g, replacement: "from '@routes/" },

  // ===== WITHOUT TRAILING SLASH (Index imports) =====
  // 6+ levels
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/redux['"]/g, replacement: "from '@redux'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/component['"]/g, replacement: "from '@components'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/screen['"]/g, replacement: "from '@screens'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/utils['"]/g, replacement: "from '@utils'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/theme['"]/g, replacement: "from '@theme'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/assets['"]/g, replacement: "from '@assets'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/types['"]/g, replacement: "from '@types'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/hook['"]/g, replacement: "from '@hooks'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/navigators['"]/g, replacement: "from '@navigators'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/services['"]/g, replacement: "from '@services'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/routes['"]/g, replacement: "from '@routes'" },

  // 5 levels
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/redux['"]/g, replacement: "from '@redux'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/component['"]/g, replacement: "from '@components'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/screen['"]/g, replacement: "from '@screens'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/utils['"]/g, replacement: "from '@utils'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/theme['"]/g, replacement: "from '@theme'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/assets['"]/g, replacement: "from '@assets'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/types['"]/g, replacement: "from '@types'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/hook['"]/g, replacement: "from '@hooks'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/navigators['"]/g, replacement: "from '@navigators'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/services['"]/g, replacement: "from '@services'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/routes['"]/g, replacement: "from '@routes'" },

  // 4 levels
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/redux['"]/g, replacement: "from '@redux'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/component['"]/g, replacement: "from '@components'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/screen['"]/g, replacement: "from '@screens'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/utils['"]/g, replacement: "from '@utils'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/theme['"]/g, replacement: "from '@theme'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/assets['"]/g, replacement: "from '@assets'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/types['"]/g, replacement: "from '@types'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/hook['"]/g, replacement: "from '@hooks'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/navigators['"]/g, replacement: "from '@navigators'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/services['"]/g, replacement: "from '@services'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/routes['"]/g, replacement: "from '@routes'" },

  // 3 levels
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/redux['"]/g, replacement: "from '@redux'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/component['"]/g, replacement: "from '@components'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/screen['"]/g, replacement: "from '@screens'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/utils['"]/g, replacement: "from '@utils'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/theme['"]/g, replacement: "from '@themes'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/assets['"]/g, replacement: "from '@assets'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/types['"]/g, replacement: "from '@types'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/hook['"]/g, replacement: "from '@hooks'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/navigators['"]/g, replacement: "from '@navigators'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/services['"]/g, replacement: "from '@services'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/routes['"]/g, replacement: "from '@routes'" },
];

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    let changeCount = 0;

    replacements.forEach(({ pattern, replacement }) => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        changed = true;
        changeCount += matches.length;
      }
    });

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
       return changeCount;
    } else {
       return 0;
    }
  } catch (error) {
     return 0;
  }
}

function migrateDirectory(dirPath) {
  let totalChanges = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', 'build', 'dist', '.git'].includes(item)) {
          totalChanges += migrateDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        if (/\.(ts|tsx|js|jsx)$/.test(item)) {
          totalChanges += migrateFile(fullPath);
        }
      }
    });
  } catch (error) {
   }
  
  return totalChanges;
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
   process.exit(1);
}

 
let totalChanges = 0;
args.forEach(target => {
  try {
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
       totalChanges += migrateDirectory(target);
    } else if (stat.isFile()) {
       totalChanges += migrateFile(target);
    }
  } catch (error) {
   }
});

 