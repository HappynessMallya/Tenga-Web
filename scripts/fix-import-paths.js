const fs = require('fs');
const path = require('path');

const importMappings = {
  // Core services
  '../services/database': '../services/core/database',
  '../services/error': '../services/core/error',
  './services/database': './services/core/database',
  './services/error': './services/core/error',

  // Domain services
  '../services/user': '../services/domain/user',
  './services/user': './services/domain/user',

  // Infrastructure services
  '../services/realtime': '../services/infrastructure/realtime',
  './services/realtime': './services/infrastructure/realtime',
};

function updateImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let updatedContent = content;
    let hasChanges = false;

    Object.entries(importMappings).forEach(([oldPath, newPath]) => {
      const importRegex = new RegExp(`from ['"]${oldPath}['"]`, 'g');
      const requireRegex = new RegExp(`require\\(['"]${oldPath}['"]\\)`, 'g');

      if (importRegex.test(updatedContent) || requireRegex.test(updatedContent)) {
        updatedContent = updatedContent.replace(importRegex, `from '${newPath}'`);
        updatedContent = updatedContent.replace(requireRegex, `require('${newPath}')`);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Updated imports in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function scanDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];

  function scan(currentPath) {
    const items = fs.readdirSync(currentPath);

    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }

  scan(dirPath);
  return files;
}

// Main execution
console.log('🔧 Fixing import paths after service reorganization...\n');

const appDir = path.join(__dirname, '../app');
const files = scanDirectory(appDir);

let updatedCount = 0;
files.forEach(file => {
  if (updateImportsInFile(file)) {
    updatedCount++;
  }
});

console.log(`\n✨ Import fix completed! Updated ${updatedCount} files.`);

// Also update the main services index file
const servicesIndexPath = path.join(__dirname, '../app/lib/services/index.ts');
const indexContent = `// Core Services
export * from './core/database';
export * from './core/error';
export * from './core/cache';

// Domain Services  
export * from './domain/user';
export * from './auth';
export * from './order';
export * from './delivery';
export * from './notification';
export * from './vendor';
export * from './payment';
export * from './review';
export * from './garmentService';
export * from './orderService';
export * from './orderPhotoService';
export * from './permissions';
export * from './location';
export * from './network';

// Infrastructure Services
export * from './infrastructure/realtime';
export * from './infrastructure/storage';

// Store
export * from './store';
`;

fs.writeFileSync(servicesIndexPath, indexContent);
console.log('✅ Updated services/index.ts with new structure');
