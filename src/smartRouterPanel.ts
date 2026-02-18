import * as vscode from 'vscode';
import { OpenRouterClient, OpenRouterMessage } from './openrouter';
import { IntentClassifier } from './classifier';
import { SettingsManager } from './settings';

export class SmartRouterPanel {
  public static currentPanel: SmartRouterPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _classifier: IntentClassifier;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (SmartRouterPanel.currentPanel) {
      SmartRouterPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'smartRouter',
      'Smart Router Chat',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    SmartRouterPanel.currentPanel = new SmartRouterPanel(panel);
  }

  private constructor(panel: vscode.WebviewPanel) {
    this._panel = panel;
    this._classifier = new IntentClassifier();
    this._panel.webview.html = this._getHtml();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        if (message.command === 'send') {
          await this._handleMessage(message.text);
        } else if (message.command === 'analyzeImage') {
          await this._handleImageAnalysis(message.imageData, message.prompt);
        } else if (message.command === 'executeCommand') {
          await vscode.commands.executeCommand(message.args);
        }
      },
      null,
      this._disposables
    );
  }

  private async _handleMessage(userQuery: string) {
    const settings = SettingsManager.getSettings();
    const apiKey = settings.openrouterApiKey;

    const intent = this._classifier.classify(userQuery);
    const routing = this._classifier.getRouting(intent);

    this._panel.webview.postMessage({
      command: 'routing',
      intent: intent,
      model: routing.config.model,
      cost: routing.config.cost,
      description: routing.config.description
    });

    if (!apiKey) {
      this._panel.webview.postMessage({
        command: 'response',
        text: '⚠️ **OpenRouter API key niet geconfigureerd.**\n\nGa naar VS Code Settings → zoek op `smartRouter.openrouterApiKey` en voer je API key in.\n\n*Routing zou gebruiken: `' + routing.config.model + '` (' + routing.config.description + ')*'
      });
      return;
    }

    try {
      const openrouter = new OpenRouterClient(apiKey);
      const messages = [
        { role: 'system', content: 'You are a helpful AI assistant integrated in VS Code via Smart Router.' },
        { role: 'user', content: userQuery }
      ];

      this._panel.webview.postMessage({ command: 'thinking' });

      const result = await openrouter.complete(routing.config.model, messages, {
        max_tokens: routing.config.maxTokens,
        temperature: 0.7
      });

      const responseText = result.choices[0]?.message?.content || 'Geen response ontvangen.';
      this._panel.webview.postMessage({ command: 'response', text: responseText });
    } catch (e: any) {
      this._panel.webview.postMessage({
        command: 'response',
        text: `❌ **Fout:** ${e.message}\n\nControleer je OpenRouter API key in VS Code settings.`
      });
    }
  }

  private async _handleImageAnalysis(imageData: string, prompt: string, timeoutId?: number) {
    const settings = SettingsManager.getSettings();
    const apiKey = settings.openrouterApiKey;

    if (!apiKey) {
      this._panel.webview.postMessage({
        command: 'imageAnalysisComplete',
        text: '⚠️ **OpenRouter API key niet geconfigureerd.**\n\nGa naar VS Code Settings → zoek op `smartRouter.openrouterApiKey` en voer je API key in.',
        timeoutId
      });
      return;
    }

    try {
      const openrouter = new OpenRouterClient(apiKey);
      
      // Use multimodal intent for image analysis
      const messages: OpenRouterMessage[] = [
        { 
          role: 'system', 
          content: 'You are a helpful AI assistant specialized in analyzing screenshots and code. Provide detailed analysis and suggestions for improvements. Be concise but thorough.' 
        },
        { 
          role: 'user', 
          content: [
            { type: 'text', text: prompt || 'Analyseer deze screenshot en identificeer problemen en suggesties voor verbetering.' },
            { type: 'image_url', image_url: { url: imageData } }
          ]
        }
      ];

      // Set timeout for 30 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Image analysis timeout')), 30000);
      });

      // Race between analysis and timeout
      const result = await Promise.race([
        openrouter.complete('qwen/qwen3-vl-32b-instruct', messages, {
          max_tokens: 1500, // Reduced for faster response
          temperature: 0.3
        }),
        timeoutPromise
      ]) as any;

      const responseText = result.choices?.[0]?.message?.content || 'Geen response ontvangen.';
      
      this._panel.webview.postMessage({
        command: 'imageAnalysisComplete',
        text: responseText,
        timeoutId
      });
    } catch (e: any) {
      this._panel.webview.postMessage({
        command: 'imageAnalysisComplete',
        text: `❌ **Fout bij image analysis:** ${e.message}\n\nControleer je OpenRouter API key in VS Code settings.`,
        timeoutId
      });
    }
  }

  private _getHtml(): string {
    return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Smart Router Chat</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: var(--vscode-font-family);
    font-size: var(--vscode-font-size);
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }
  #header {
    padding: 10px 16px;
    background: var(--vscode-titleBar-activeBackground);
    border-bottom: 1px solid var(--vscode-panel-border);
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: bold;
    font-size: 13px;
  }
  #routing-bar {
    padding: 6px 16px;
    background: var(--vscode-editorWidget-background);
    border-bottom: 1px solid var(--vscode-panel-border);
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    min-height: 28px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .badge {
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    border-radius: 3px;
    padding: 1px 6px;
    font-size: 10px;
    font-weight: bold;
  }
  #messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .message {
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 8px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .message.user {
    align-self: flex-end;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
  }
  .message.assistant {
    align-self: flex-start;
    background: var(--vscode-editorWidget-background);
    border: 1px solid var(--vscode-panel-border);
  }
  .message.thinking {
    align-self: flex-start;
    background: transparent;
    color: var(--vscode-descriptionForeground);
    font-style: italic;
    padding: 4px 0;
  }
  #input-area {
    padding: 12px 16px;
    border-top: 1px solid var(--vscode-panel-border);
    display: flex;
    gap: 8px;
    background: var(--vscode-editor-background);
  }
  #input {
    flex: 1;
    padding: 8px 12px;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border);
    border-radius: 4px;
    font-family: inherit;
    font-size: inherit;
    resize: none;
    min-height: 38px;
    max-height: 120px;
    outline: none;
  }
  #input:focus { border-color: var(--vscode-focusBorder); }
  #send {
    padding: 8px 16px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    align-self: flex-end;
  }
  #send:hover { background: var(--vscode-button-hoverBackground); }
  #send:disabled { opacity: 0.5; cursor: not-allowed; }
  #image-upload-area {
    border: 2px dashed var(--vscode-input-border);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 10px;
    text-align: center;
    transition: border-color 0.2s;
  }
  #image-upload-area:hover {
    border-color: var(--vscode-focusBorder);
  }
  #upload-prompt {
    color: var(--vscode-descriptionForeground);
    font-size: 13px;
  }
  #upload-prompt a {
    color: var(--vscode-textLink-foreground);
    text-decoration: underline;
  }
  #image-prompt {
    display: flex;
    gap: 8px;
  }
  #analyze-btn, #cancel-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  }
  #analyze-btn {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
  }
  #analyze-btn:hover {
    background: var(--vscode-button-hoverBackground);
  }
  #cancel-btn {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
  }
  #cancel-btn:hover {
    background: var(--vscode-button-secondaryHoverBackground);
  }
  #quick-commands {
    display: flex;
    gap: 6px;
    padding: 8px 12px;
    background: var(--vscode-editor-background);
    border-bottom: 1px solid var(--vscode-panel-border);
    flex-wrap: wrap;
  }
  .quick-cmd {
    padding: 4px 8px;
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
    border: 1px solid var(--vscode-button-border);
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;
  }
  .quick-cmd:hover {
    background: var(--vscode-button-secondaryHoverBackground);
    border-color: var(--vscode-focusBorder);
  }
  .quick-cmd:active {
    transform: scale(0.95);
  }
  code { 
    background: var(--vscode-textCodeBlock-background);
    padding: 1px 4px;
    border-radius: 3px;
    font-family: var(--vscode-editor-font-family);
    font-size: 0.9em;
  }
</style>
</head>
<body>
<div id="header">
  🧠 Smart Router Chat
  <span style="font-weight:normal;color:var(--vscode-descriptionForeground);font-size:11px;">powered by OpenRouter</span>
</div>
<div id="quick-commands">
  <button class="quick-cmd" onclick="executeCommand('smart.analyzeImage')" title="Analyseer screenshot">📷 Analyze Image</button>
  <button class="quick-cmd" onclick="executeCommand('smart.validateSystem')" title="Valideer systeem">✅ Validate</button>
  <button class="quick-cmd" onclick="executeCommand('smart.showCosts')" title="Toon kosten">💰 Costs</button>
  <button class="quick-cmd" onclick="executeCommand('smart.runDailyEval')" title="Dagelijkse evaluatie">🔭 Daily Eval</button>
  <button class="quick-cmd" onclick="executeCommand('smart.showRooCodeStatus')" title="Roo Code status">🤖 Roo Code</button>
</div>
<div id="routing-bar">
  <span id="routing-info">Wacht op eerste bericht...</span>
</div>
<div id="messages">
  <div class="message assistant">👋 Hallo! Ik ben Smart Router. Stel een vraag of geef een taak en ik selecteer automatisch het beste AI model via OpenRouter.</div>
</div>
<div id="input-area">
  <div id="image-upload-area" ondrop="handleDrop(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)">
    <input type="file" id="image-input" accept="image/*" style="display:none" onchange="handleImageSelect(event)">
    <div id="upload-prompt">
      📷 Sleep een screenshot hier of <a href="#" onclick="document.getElementById('image-input').click(); return false;">klik om te selecteren</a>
    </div>
    <div id="image-preview" style="display:none">
      <img id="preview-img" style="max-width:200px;max-height:150px;border-radius:4px;margin-bottom:8px">
      <div id="image-prompt">
        <input type="text" id="prompt-input" placeholder="Wat wil je weten over deze screenshot?" style="width:100%;padding:8px;margin-bottom:8px;border:1px solid var(--vscode-input-border);background:var(--vscode-input-background);color:var(--vscode-input-foreground);border-radius:4px">
        <button id="analyze-btn" onclick="analyzeImage()">Analyseer</button>
        <button id="cancel-btn" onclick="cancelImage()">Annuleren</button>
      </div>
    </div>
  </div>
  <textarea id="input" placeholder="Typ je vraag hier... (Enter = verstuur, Shift+Enter = nieuwe regel)" rows="1"></textarea>
  <button id="send">Verstuur</button>
</div>
<script>
  const vscode = acquireVsCodeApi();
  const messagesEl = document.getElementById('messages');
  const inputEl = document.getElementById('input');
  const sendBtn = document.getElementById('send');
  const routingEl = document.getElementById('routing-info');
  let thinkingEl = null;

  function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = 'message ' + type;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function removeThinking() {
    if (thinkingEl) { thinkingEl.remove(); thinkingEl = null; }
  }

  sendBtn.addEventListener('click', send);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });

  function send() {
    const text = inputEl.value.trim();
    if (!text || sendBtn.disabled) return;
    addMessage(text, 'user');
    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;
    vscode.postMessage({ command: 'send', text });
  }

  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  });

  // Image upload functionality
  let selectedImageData = null;

  function handleDragOver(e) {
    e.preventDefault();
    document.getElementById('image-upload-area').style.borderColor = 'var(--vscode-focusBorder)';
  }

  function handleDragLeave(e) {
    e.preventDefault();
    document.getElementById('image-upload-area').style.borderColor = 'var(--vscode-input-border)';
  }

  function handleDrop(e) {
    e.preventDefault();
    document.getElementById('image-upload-area').style.borderColor = 'var(--vscode-input-border)';
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleImageFile(files[0]);
    }
  }

  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    }
  }

  function handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      selectedImageData = e.target.result;
      document.getElementById('preview-img').src = selectedImageData;
      document.getElementById('upload-prompt').style.display = 'none';
      document.getElementById('image-preview').style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  function analyzeImage() {
    if (!selectedImageData) return;
    
    const prompt = document.getElementById('prompt-input').value.trim();
    addMessage('📷 Analyseren screenshot...', 'user');
    
    // Show progress
    const progressMsg = addMessage('⏳ Bezig met analyseren (dit kan 10-30 seconden duren)...', 'thinking');
    
    // Start timeout for better UX
    let analysisTimeout = setTimeout(() => {
      if (progressMsg && progressMsg.parentNode) {
        progressMsg.textContent = '⏳ Analyseren... (nog 10-20 seconden)...';
      }
    }, 10000);
    
    vscode.postMessage({ 
      command: 'analyzeImage', 
      imageData: selectedImageData,
      prompt: prompt,
      timeoutId: analysisTimeout
    });
    
    cancelImage();
  }

  function cancelImage() {
    selectedImageData = null;
    document.getElementById('preview-img').src = '';
    document.getElementById('prompt-input').value = '';
    document.getElementById('upload-prompt').style.display = 'block';
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('image-input').value = '';
  }

  function executeCommand(command) {
    vscode.postMessage({ command: 'executeCommand', args: command });
  }

  window.addEventListener('message', (event) => {
    const msg = event.data;
    if (msg.command === 'routing') {
      routingEl.innerHTML = 
        '<span class="badge">' + msg.intent + '</span> → ' +
        '<code>' + msg.model + '</code> · $' + msg.cost + '/1M · ' + msg.description;
    } else if (msg.command === 'thinking') {
      thinkingEl = addMessage('⏳ Bezig met antwoord...', 'thinking');
    } else if (msg.command === 'response') {
      removeThinking();
      addMessage(msg.text, 'assistant');
      sendBtn.disabled = false;
      inputEl.focus();
    } else if (msg.command === 'imageAnalysisComplete') {
      // Clear any pending timeouts
      if (msg.timeoutId) {
        clearTimeout(msg.timeoutId);
      }
      removeThinking();
      addMessage(msg.text, 'assistant');
    }
  });

  inputEl.focus();
</script>
</body>
</html>`;
  }

  public dispose() {
    SmartRouterPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const d = this._disposables.pop();
      if (d) d.dispose();
    }
  }
}
