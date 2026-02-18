const fs = require('fs');
const path = require('path');

const src = 'C:\\Dev\\smart-router-v2.0.0';
const dst = 'C:\\Users\\Gebruiker\\.vscode\\extensions\\universal-vibe.smart-router-2.7.0';

function copyDir(from, to) {
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      try {
        fs.copyFileSync(s, d);
      } catch(e) {
        console.warn('SKIP:', s, '-', e.message);
      }
    }
  }
}

// Copy out/ folder
console.log('Copying out/...');
copyDir(path.join(src, 'out'), path.join(dst, 'out'));

// Copy node_modules/axios only (the only runtime dependency)
console.log('Copying node_modules/axios...');
copyDir(path.join(src, 'node_modules', 'axios'), path.join(dst, 'node_modules', 'axios'));

// Copy node_modules/follow-redirects (axios dependency)
const followRedirects = path.join(src, 'node_modules', 'follow-redirects');
if (fs.existsSync(followRedirects)) {
  console.log('Copying node_modules/follow-redirects...');
  copyDir(followRedirects, path.join(dst, 'node_modules', 'follow-redirects'));
}

// Copy node_modules/form-data (axios dependency)
const formData = path.join(src, 'node_modules', 'form-data');
if (fs.existsSync(formData)) {
  console.log('Copying node_modules/form-data...');
  copyDir(formData, path.join(dst, 'node_modules', 'form-data'));
}

// Copy node_modules/proxy-from-env (axios dependency)
const proxyFromEnv = path.join(src, 'node_modules', 'proxy-from-env');
if (fs.existsSync(proxyFromEnv)) {
  console.log('Copying node_modules/proxy-from-env...');
  copyDir(proxyFromEnv, path.join(dst, 'node_modules', 'proxy-from-env'));
}

// Copy package.json zonder BOM (BOM breekt VS Code extensie loading)
console.log('Copying package.json...');
let pkgContent = fs.readFileSync(path.join(src, 'package.json'), 'utf8');
if (pkgContent.charCodeAt(0) === 0xFEFF) pkgContent = pkgContent.slice(1); // strip BOM
fs.writeFileSync(path.join(dst, 'package.json'), pkgContent, 'utf8');

console.log('DONE - Extension deployed to', dst);
console.log('Files in out/:', fs.readdirSync(path.join(dst, 'out')).length);
