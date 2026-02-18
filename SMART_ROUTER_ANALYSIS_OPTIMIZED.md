# 🚀 Smart Router - Werkplan & Status

*Laatst bijgewerkt: 18 februari 2026*

---

## 📊 Current Status: v2.7.0 ✅ VOLLEDIG WERKEND

### ✅ Voltooide features (18 feb 2026)

| Feature | Status | Details |
|---|---|---|
| Roo Code integratie | ✅ | v3.48.0 gedetecteerd, 39 commands |
| Chat Panel (webview) | ✅ | Werkt zonder GitHub Copilot |
| OpenRouter routing | ✅ | Direct via https module (geen axios) |
| ProactiveValidator | ✅ | Healthy, 0 issues |
| Model ID fixes | ✅ | Dot-notatie (4.6 niet 4-6) |
| Sonnet 4.6 1M context | ✅ | roo_architect maxTokens=1M |
| Qwen3.5 flagship | ✅ | 397B model geïntegreerd |
| WATCHLIST.md | ✅ | Dagelijkse monitoring protocol |
| GitHub commit | ✅ | master branch up-to-date |

### ⚠️ Bekende limitaties

| Limitatie | Oorzaak | Workaround |
|---|---|---|
| `@smart` → "Language model unavailable" | VS Code Chat vereist GitHub Copilot als LM provider | Gebruik `smart.openChat` panel |
| `swe-1.5` niet op OpenRouter | Windsurf-intern model, geen publieke API | Vervangen door `qwen/qwen3-235b-a22b` |
| Ling-2.5-1T / Ring-2.5-1T niet beschikbaar | Nog niet op OpenRouter (alleen Hugging Face) | Staat op WATCHLIST, dagelijks checken |

### 🔧 Actieve routing (geverifieerd op OpenRouter)

| Intent | Model | Context | Kosten |
|---|---|---|---|
| `simple` | `xiaomi/mimo-v2-flash` | 4K | FREE |
| `code_gen` | `qwen/qwen3-235b-a22b` | 8K | FREE |
| `debug` | `minimax/minimax-m2.5` | 8K | $0.28 |
| `architecture` | `qwen/qwen3-235b-a22b` | 8K | FREE |
| `architecture_screening` | `thudm/glm-4-32b` | 128K | $0.21 |
| `architecture_screening_alt` | `qwen/qwen3.5-397b-a17b` | 262K | $0.36 |
| `architecture_premium` | `anthropic/claude-opus-4.6` | 1M | $5.00 |
| `roo_architect` | `anthropic/claude-sonnet-4.6` | 1M | $3.00 |
| `roo_premium` | `anthropic/claude-opus-4.6` | 1M | $15.00 |

### 🚀 Commands (19 totaal)

- `smart.openChat` — Chat panel (geen Copilot nodig)
- `smart.validateSystem` — Systeem validatie
- `smart.showRooCodeStatus` — Roo Code integratie rapport
- `smart.delegateToRooCode` — Handmatige Roo Code delegatie
- `smart.toggleRooCode` — Toggle integratie aan/uit
- `smart.showCosts` / `smart.showCostPredictions`
- `smart.startArena` / `smart.showChineseModels`
- `smart.analyzeImage` / `smart.showHealth`
- `smart.showPerformance` / `smart.showContextCache`
- `smart.explainRouting` / `smart.openSettings`
- En meer...

---

## 📅 Changelog

| Datum | Versie | Wijziging |
|---|---|---|
| 18 feb 2026 | v2.7.0 | Roo Code integratie, Chat Panel, model ID fixes |
| 18 feb 2026 | v2.7.0 | Claude Sonnet 4.6 1M context (Anthropic release) |
| 18 feb 2026 | v2.7.0 | Qwen3.5 397B flagship routing |
| 18 feb 2026 | v2.7.0 | WATCHLIST.md dagelijkse monitoring |
| 18 feb 2026 | v2.7.0 | Validator fix: /api/v1/models lijst |
| eerder | v2.6.0 | Auto-healing, predictive cost, performance monitor |
| eerder | v2.3.0 | ProactiveValidator |
| eerder | v2.2.0 | Screenshot analyse |
| eerder | v2.1.0 | GLM-5 integratie |

---

## 🎯 Roadmap

### v2.8.0 — Nieuwe routing intents (volgende sprint)

| Intent | Model kandidaat | Trigger |
|---|---|---|
| `computer_use` | `anthropic/claude-sonnet-4.6` | "click", "open app", "navigate" |
| `reasoning` | Ring-2.5-1T (zodra op OpenRouter) | "bewijs", "wiskundig", "logisch" |
| `ultra_long` | `anthropic/claude-sonnet-4.6` (1M) | >100K token context |
| `multimodal` | Ming-Flash-Omni-2.0 (zodra beschikbaar) | audio/beeld taken |

### v2.8.0 — AI Ecosystem features

- **Agent Marketplace** — Community-driven agents
- **Multi-Platform Bridge** — Cursor AI, Windsurf/Cascade sync
- **Advanced Analytics** — Usage patterns, ROI calculator
- **Dynamic Model Updates** — Automatische routing op basis van OpenRouter rankings

### v2.9.0 — Enterprise

- Team workspaces, RBAC
- On-premise deployment optie
- Compliance suite

---

## 👀 Watchlist (dagelijks checken)

Zie `WATCHLIST.md` voor volledige details.

**Prioriteit:**

1. **Ling-2.5-1T** op OpenRouter → `debug` routing (75% goedkoper)
2. **Ring-2.5-1T** op OpenRouter → `reasoning` intent
3. **Qwen3.5 visual agent** → `computer_use` intent

---

## �️ VS Code Werkwijze

### Dagelijkse workflow

| Taak | Actie |
|---|---|
| Chat met AI | `Ctrl+Shift+P` → **Smart Router: Open Chat Panel** |
| Systeem check | `Ctrl+Shift+P` → **Smart Router: Validate System** |
| Roo Code status | `Ctrl+Shift+P` → **Smart Router: Show Roo Code Integration Status** |
| Kosten bekijken | `Ctrl+Shift+P` → **Smart Router: Show Model Costs** |
| Taak delegeren | `Ctrl+Shift+P` → **Smart Router: Delegate Task to Roo Code** |
| Watchlist checken | Open `WATCHLIST.md` → bronnen dagelijks nalopen |

### Na elke code wijziging

```bash
npx tsc -p ./
node deploy_ext.js
cmd /c "rmdir /s /q C:\Users\Gebruiker\.vscode\extensions\universal-vibe.smart-router-2.7.0\node_modules"
```

Dan in VS Code: `Ctrl+Shift+P` → **Developer: Reload Window**

### Nieuwe model toevoegen (uit WATCHLIST)

1. Verifieer ID op [openrouter.ai/models](https://openrouter.ai/models)
2. Update `src/models.ts` — voeg intent toe of update bestaande
3. Update `src/rooCodeBridge.ts` — voeg toe aan `ROO_CODE_MODELS` indien relevant
4. Compileer + deploy (zie boven)
5. Voeg toe aan **Beschikbaar** tabel in `WATCHLIST.md`
6. Git commit + push

### ⚠️ @smart in VS Code Chat

`@smart` werkt **niet** zonder GitHub Copilot — VS Code Chat API vereist een language model provider.

**Gebruik in plaats daarvan:** `Ctrl+Shift+P` → **Smart Router: Open Chat Panel**

Dit panel werkt direct via OpenRouter zonder Copilot.

---

## 📊 Competitive Intelligence

| Concurrent | Usage | Smart Router voordeel |
|---|---|---|
| Cline | 1.67M | Roo Code integratie + cost tracking |
| liteLLM | 1.43M | VS Code native + webview panel |
| BLACKBOXAI | 1.28M | OpenRouter multi-model routing |

---

*Smart Router v2.7.0 — AI model routing + Roo Code integratie + dagelijkse markt monitoring*
