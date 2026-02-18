try {
  require('C:/Users/Gebruiker/.vscode/extensions/universal-vibe.smart-router-2.7.0/out/extension.js');
  console.log('OK - no load error');
} catch(e) {
  console.error('LOAD ERROR:', e.message);
  console.error('STACK:', e.stack);
}
