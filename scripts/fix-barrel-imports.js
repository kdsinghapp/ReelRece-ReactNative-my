#!/usr/bin/env node

/**
 * Fix Barrel Imports Script
 * 
 * Converts barrel imports (imports from index files) to use path aliases
 * Example: from '../../../component' -> from '@components'
 */

const fs = require('fs');
const path = require('path');

// Define barrel import replacements (without trailing slash/path)
const barrelReplacements = [
  // 6+ levels
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/component['"]/g, replacement: "from '@components'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/redux['"]/g, replacement: "from '@redux'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/utils['"]/g, replacement: "from '@utils'" },
  
  // 5 levels
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/component['"]/g, replacement: "from '@components'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/redux['"]/g, replacement: "from '@redux'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/utils['"]/g, replacement: "from '@utils'" },
  
  // 4 levels
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/component['"]/g, replacement: "from '@components'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/redux['"]/g, replacement: "from '@redux'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/utils['"]/g, replacement: "from '@utils'" },
  
  // 3 levels
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/component['"]/g, replacement: "from '@components'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/redux['"]/g, replacement: "from '@redux'" },
  { pattern: /from ['"]\.\.\/\.\.\/\.\.\/utils['"]/g, replacement: "from '@utils'" },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    let changeCount = 0;

    barrelReplacements.forEach(({ pattern, replacement }) => {
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

function fixDirectory(dirPath) {
  let totalChanges = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', 'build', 'dist', '.git', 'docs'].includes(item)) {
          totalChanges += fixDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        if (/\.(ts|tsx|js|jsx)$/.test(item)) {
          totalChanges += fixFile(fullPath);
        }
      }
    });
  } catch (error) {
   }
  
  return totalChanges;
}

// Main execution
 
const srcPath = path.join(process.cwd(), 'src');
const totalChanges = fixDirectory(srcPath);

 
if (totalChanges > 0) {
 
}
