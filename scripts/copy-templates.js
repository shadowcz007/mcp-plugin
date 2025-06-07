const fs = require('fs-extra');
const path = require('path');

const srcDir = path.join(__dirname, '../src/templates');
const destDir = path.join(__dirname, '../dist/templates');

async function copyTemplates() {
  try {
    await fs.copy(srcDir, destDir );
    console.log('Templates copied successfully!');
  } catch (err) {
    console.error('Error copying templates:', err);
    process.exit(1);
  }
}

copyTemplates();

const srcHtmlPath = path.join(__dirname, '../src/index.html');
const destHtmlPath = path.join(__dirname, '../dist/index.html');

fs.copy(srcHtmlPath, destHtmlPath);


