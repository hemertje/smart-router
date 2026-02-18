# Smart Router v2.7.0 - Complete Project Guide

> Self-contained handleiding voor ontwikkeling zonder AI assistentie.
> Alles wat je nodig hebt staat hierin.

---

## Quick Start

```bash
# 1. Compileer
npx tsc -p ./

# 2. Deploy naar VS Code
node deploy_ext.js

# 3. Clean node_modules (optimaliseert startup)
cmd /c "rmdir /s /q C:\Users\Gebruiker\.vscode\extensions\universal-vibe.smart-router-2.7.0\node_modules"

# 4. Reload VS Code
# Ctrl+Shift+P → Developer: Reload Window
```

---

## Project Structuur

```
smart-router-v2.0.0/
├── src/
│   ├── extension.ts          # Entry point, commands registreren
│   ├── models.ts             # MODEL_ROUTING + ARENA_BATTLE_GROUPS
│   ├── dailyEvaluator.ts     # Dagelijkse automatische monitoring
│   ├── smartRouterPanel.ts   # Webview chat panel (geen Copilot nodig)
│   ├── proactiveValidator.ts # Systeem health check
│   ├── openrouter.ts         # OpenRouter API client
│   ├── classifier.ts         # Intent classificatie
│   ├── rooCodeBridge.ts      # Roo Code integratie
│   ├── logger.ts             # Logger singleton
│   └── settings.ts           # VS Code settings management
├── AGENTS.md                 # Windsurf/Cascade context
├── WATCHLIST.md              # Dagelijkse monitoring
├── SMART_ROUTER_ANALYSIS_OPTIMIZED.md  # Werkplan + roadmap
└── PROJECT_README.md         # Deze handleiding
```

---

## Kernconcepten

### 1. Intent Routing
De extensie classificeert je query en routeert naar het beste model:

```typescript
// Voorbeeld: "schrijf een react component" → code_gen intent
// Routeert naar: qwen/qwen3-235b-a22b (gratis)
```

### 2. DailyEvaluator
Draait automatisch 1x per dag bij VS Code startup:
- Checkt OpenRouter op nieuwe/verdwenen modellen
- Update WATCHLIST.md en werkplan
- Auto-updates routing bij WATCHLIST hits
- Auto git commit na wijzigingen

### 3. Chat Panel
`Ctrl+Shift+P` → "Smart Router: Open Chat Panel"
- Werkt zonder GitHub Copilot
- Directe OpenRouter integratie

---

## Actieve Routing Tabel

| Intent | Model | Context | Kosten | Use Case |
|---|---|---|---|---|
| simple | xiaomi/mimo-v2-flash | 4K | FREE | Simpele vragen |
| code_gen | qwen/qwen3-235b-a22b | 8K | FREE | Code generatie |
| debug | minimax/minimax-m2.5 | 8K | $0.28 | Debug taken |
| architecture | qwen/qwen3-235b-a22b | 8K | FREE | Architectuur screening |
| architecture_screening | qwen/qwen3-235b-a22b | 8K | FREE | Screening (was glm-4-32b) |
| architecture_screening_alt | qwen/qwen3.5-397b-a17b | 262K | $0.36 | Premium screening |
| architecture_premium | anthropic/claude-opus-4.6 | 1M | $5.00 | Deep dive |
| roo_code_gen | anthropic/claude-haiku-4.5 | 200K | $0.80 | Roo Code code gen |
| roo_architect | anthropic/claude-sonnet-4.6 | 1M | $3.00 | Roo Code architect |
| roo_debug | google/gemini-2.0-flash-001 | 1M | $0.10 | Roo Code debug |
| roo_premium | anthropic/claude-opus-4.6 | 1M | $15.00 | Roo Code premium |

---

## Commands (19 totaal)

### Core Commands
- `smart.openChat` — Chat panel (geen Copilot nodig)
- `smart.validateSystem` — Systeem validatie
- `smart.runDailyEval` — Handmatige dagelijkse evaluatie

### Roo Code Integration
- `smart.showRooCodeStatus` — Integratie status
- `smart.delegateToRooCode` — Taak delegeren
- `smart.toggleRooCode` — Integratie aan/uit

### Analytics & Monitoring
- `smart.showCosts` — Kosten overzicht
- `smart.showPerformance` — Performance dashboard
- `smart.showHealth` — Health dashboard
- `smart.showCostPredictions` — Kosten voorspellingen

### Arena Mode
- `smart.startArena` — Arena battle modus
- `smart.showChineseModels` — Chinese modellen

### Utilities
- `smart.analyzeImage` — Afbeelding analyse
- `smart.explainRouting` — Routing uitleg
- `smart.openSettings` — Settings openen
- `smart.showContextCache` — Context cache
- `smart.clearContextCache` — Cache legen

---

## Kritieke Regels

### Logger Gebruik
```typescript
// ✅ Correct
Logger.getInstance().info('message');
Logger.getInstance().warn('warning');
Logger.getInstance().error('error', error);

// ❌ Fout
Logger.log('message'); // Bestaat niet
```

### Model ID Notatie
```typescript
// ✅ Correct - dot notatie
model: 'anthropic/claude-sonnet-4.6'
model: 'anthropic/claude-opus-4.6'

// ❌ Fout - hyphen notatie
model: 'anthropic/claude-sonnet-4-6'
```

### Versie Filter
DailyEvaluator rapporteert alleen modellen met versie > huidige max (4.6)

---

## Bekende Limitaties

| Issue | Oorzaak | Workaround |
|---|---|---|
| `@smart` → "Language model unavailable" | VS Code Chat vereist GitHub Copilot | Gebruik `smart.openChat` panel |
| `claude-haiku-4.6` niet beschikbaar | Anthropic heeft geen 4.6 haiku | `claude-haiku-4.5` is correct |
| Ling-2.5-1T / Ring-2.5-1T niet beschikbaar | Nog niet op OpenRouter | WATCHLIST, dagelijks gecheckt |

---

## Troubleshooting

### TypeScript Errors
```bash
# Check alle errors
npx tsc --noEmit

# Specifiek bestand
npx tsc src/dailyEvaluator.ts --noEmit
```

### Extension Start Problemen
```bash
# Check output channel
# Ctrl+Shift+P → Developer: Show Output Channel → "Smart Router"

# Check extension logs
# %APPDATA%\Code\logs\*
```

### API Key Problemen
```bash
# Check VS Code settings
# Ctrl+Shift+P → Preferences: Open Settings (JSON)
# Zoek: "smartRouter.openrouterApiKey"
```

---

## Development Workflow

### 1. Code Wijzigingen
- Edit TypeScript bestanden
- Test met `npx tsc -p ./`
- Fix errors indien nodig

### 2. Testen
```bash
# Deploy
node deploy_ext.js

# Clean node_modules
cmd /c "rmdir /s /q C:\Users\Gebruiker\.vscode\extensions\universal-vibe.smart-router-2.7.0\node_modules"

# Reload VS Code
# Ctrl+Shift+P → Developer: Reload Window
```

### 3. Validate
```bash
# In VS Code:
# Ctrl+Shift+P → "Smart Router: Validate System"
# Ctrl+Shift+P → "Smart Router: Run Daily Evaluation Now"
```

### 4. Commit
```bash
git add -A
git commit -m "feat: beschrijving"
git push
```

---

## Watchlist Prioriteit

1. **Ling-2.5-1T** → `debug` routing (75% goedkoper)
2. **Ring-2.5-1T** → `reasoning` intent
3. **Qwen3 Max Thinking** → `architecture_premium` alternatief
4. **Qwen3 Coder Next** → `code_gen` upgrade

Check dagelijks: [OpenRouter Models](https://openrouter.ai/models)

---

## Arena Mode Battle Groups

| Group | Models | Use Case |
|---|---|---|
| frontier | claude-opus-4.6, claude-sonnet-4.6, claude-opus-4.5, claude-sonnet-4.5 | Max intelligentie |
| fast | qwen3-235b-a22b, claude-haiku-4.5, gemini-2.0-flash-001, qwen3-coder-next | Snelheid |
| hybrid | claude-sonnet-4.5, qwen3-235b-a22b, minimax-m2.5 | Balans |

---

## Performance Metrics

- **Package Size**: 57KB (optimal)
- **Startup Time**: <2s
- **Memory Usage**: <50MB
- **API Timeout**: 10s
- **Daily Eval**: 1x per dag (8s na startup)

---

## Security & Privacy

- API key opgeslagen in VS Code settings (encrypted)
- Geen data verzonden naar externe servers
- OpenRouter calls via HTTPS
- Lokale logging alleen

---

## Support

### Issues
- Check `Smart Router` output channel
- Run `smart.validateSystem`
- Check GitHub issues: https://github.com/universal-vibe/smart-router

### Features Request
- GitHub discussions
- Commentaar in `SMART_ROUTER_ANALYSIS_OPTIMIZED.md`

---

## Changelog v2.7.0 (18 feb 2026)

- ✅ Chat Panel zonder Copilot
- ✅ Model ID fixes (dot-notatie)
- ✅ Claude Sonnet 4.6 1M context
- ✅ DailyEvaluator automatische monitoring
- ✅ Auto routing update bij WATCHLIST hit
- ✅ Auto git commit na wijzigingen
- ✅ Versiefilter (alleen > 4.6 rapporteren)
- ✅ 3 unavailable models vervangen
- ✅ AGENTS.md voor AI context
- ✅ PROJECT_README.md self-contained handleiding

---

*Smart Router v2.7.0 - AI model routing zonder Copilot vereiste*
