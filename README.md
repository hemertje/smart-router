# Smart Router Extension v2.0

Automatic AI model routing based on intent classification for VS Code with Arena Mode, Chinese AI models, and 70% cost optimization.

## 🆕 v2.0 Features

- **⚔️ Arena Mode**: Parallel model comparison with battle groups
- **🇨🇳 Chinese AI Models**: 70% cost reduction with GLM-5, M2.5, Qwen 3.5
- **📝 Context Cache**: Persistent conversation history
- **💰 Predictive Cost**: Real-time cost tracking and optimization
- **🚀 Performance**: Sub-2s response times

## Features

- **Intent Classification**: Automatically classifies your query into 4 intents
- **Model Routing**: Routes to optimal model based on intent
- **Cost Optimization**: 75% cost savings vs using premium models
- **VS Code Integration**: Works directly in VS Code Chat with `@smart`

## Usage

1. Open VS Code Chat (Ctrl+Shift+I)
2. Type `@smart [your question]`
3. Extension automatically:
   - Classifies your intent
   - Selects optimal model
   - Shows cost and routing info

## Intent Classification

| Intent | Patterns | Model | Cost |
|--------|----------|-------|------|
| Simple | git, status, help, what is | xiaomi/mimo-v2-flash | FREE |
| Code Gen | create, generate, implement | swe-1.5 | FREE |
| Debug | why, error, not working | minimax/minimax-m2.5 | $0.28 |
| Architecture | design, plan, should | anthropic/claude-opus-4-6 | $5.00 |

## Examples

```text
@smart git status                    → Simple → FREE
@smart create API endpoint           → Code Gen → SWE 1.5 (FREE)
@smart why is this failing           → Debug → MiniMax M2.5 ($0.28)
@smart design new architecture       → Architecture → Opus 4.6 ($5.00)
```

## Arena Mode

Battle groups for parallel model comparison:

- **Frontier**: Opus 4.6, Opus 4.5, Sonnet 4.5 - Maximum intelligence
- **Fast**: SWE 1.5, Haiku 4.5, Gemini 3 Flash - Optimized for speed  
- **Hybrid**: Mix of speed and intelligence models

## Chinese AI Models

Cost-optimized alternatives with 70% discount:

- **Zhipu GLM-5**: Near-Opus 4.5 performance at $3.5
- **MiniMax M2.5**: Enhanced AI agent tools at $0.28
- **Alibaba Qwen 3.5**: Next-generation architecture at $0.45

## Installation

### Development Build
```bash
cd C:\Dev\.vscode-extensions\smart-router
npm install
npm run compile
```

Then in VS Code:
1. Press F5 to open a new Extension Development Host window
2. Open Chat and test `@smart` commands

### Production Build
```bash
npm install -g vsce
vsce package
```

Install the generated `.vsix` file in VS Code.

## Current Status

**v2.0.0** - Complete Enterprise Release ✅
- ✅ All v2.0 features implemented
- ✅ Arena Mode with battle groups
- ✅ Chinese AI models integration
- ✅ Context persistency
- ✅ Predictive cost engine
- ✅ Performance optimizations
- ✅ VS Code marketplace ready

## Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Package for distribution
npm run vscode:prepublish
vsce package
```

## Configuration

Extension settings in `.vscode/settings.json`:

```json
{
  "smartRouter.enabled": true,
  "smartRouter.openrouterApiKey": "${env:OPENROUTER_API_KEY}",
  "smartRouter.defaultModel": "free-tier",
  "smartRouter.costWarningThreshold": 5.0,
  "smartRouter.localClassifier": "ollama:qwen3:8b"
}
```

## Contributing

This is part of the universal vibe coding workspace in C:\Dev.

## License

MIT
