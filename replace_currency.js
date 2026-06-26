const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const targetDir = path.join(__dirname, 'app');

walkDir(targetDir, (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern 1: JSX curly braces: ₹{something} -> {something} Birr
    content = content.replace(/₹\s*\{([^}]+)\}/g, '{$1} Birr');

    // Pattern 2: Template literals: `₹${something}` -> `${something} Birr`
    content = content.replace(/₹\s*\$\{([^}]+)\}/g, '${$1} Birr');

    // Pattern 3: Hardcoded strings: ₹100 -> 100 Birr (if any)
    content = content.replace(/₹(\d+(?:\.\d+)?)/g, '$1 Birr');

    // Pattern 4: Any leftover ₹
    content = content.replace(/₹/g, 'Birr ');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});
