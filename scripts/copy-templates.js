const fs = require('fs-extra');
const path = require('path');

const srcDir = path.join(__dirname, '../src/templates');
const destDir = path.join(__dirname, '../dist/templates');

async function copyTemplates() {
  try {
    await fs.copy(srcDir, destDir);
    console.log('Templates copied successfully!');
  } catch (err) {
    console.error('Error copying templates:', err);
    process.exit(1);
  }
}

copyTemplates(); 