const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const vsixPath = 'C:\\Dev\\smart-router-v2.0.0\\smart-router-2.7.0.vsix';
const targetDir = 'C:\\Users\\Gebruiker\\.vscode\\extensions\\universal-vibe.smart-router-2.7.0';

// VSIX is a ZIP file - use PowerShell to extract
try {
  // Clean target
  if (fs.existsSync(targetDir)) {
    execSync(`rmdir /s /q "${targetDir}"`, { shell: 'cmd' });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // Extract using PowerShell Expand-Archive
  const cmd = `powershell -Command "Expand-Archive -Path '${vsixPath}' -DestinationPath '${targetDir}\\vsix_root' -Force"`;
  execSync(cmd, { stdio: 'inherit' });

  // VSIX extracts to 'extension' subfolder - move contents up
  const extensionSrc = path.join(targetDir, 'vsix_root', 'extension');
  if (fs.existsSync(extensionSrc)) {
    execSync(`xcopy /e /i /y "${extensionSrc}\\*" "${targetDir}\\"`, { shell: 'cmd', stdio: 'inherit' });
    execSync(`rmdir /s /q "${path.join(targetDir, 'vsix_root')}"`, { shell: 'cmd' });
    console.log('SUCCESS: Extension extracted to', targetDir);
  } else {
    console.log('Contents of vsix_root:');
    fs.readdirSync(path.join(targetDir, 'vsix_root')).forEach(f => console.log(' -', f));
  }
} catch(e) {
  console.error('ERROR:', e.message);
}
