# 🚀 Smart Router - Werkplan & Status

*Laatst bijgewerkt: 22 februari 2026 14:24:00 | Automatisch geëvalueerd: 22-2-2026 | ⚠️ 4 bevinding(en)*

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
| 20 feb 2026 | v2.7.0 | HECO kwaliteitsslag — zie leermomenten sectie 20 feb |
| 19 feb 2026 | v2.7.0 | HECO debugging sessie — zie leermomenten sectie 19 feb |
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

## 🧪 End-to-End Test Protocol (VERPLICHT na elke deploy)

> **Standaard in elke ultimate vibe coding omgeving.**
> `npx tsc` + `deploy_ext.js` bevestigt alleen compilatie — NOOIT functionaliteit.
> Zonder E2E test is elke versie `deployed_untested`, niet `verified`.

### E2E Checklist — uitvoeren NA Reload Window

```text
[ ] 1. EXTENSIE ACTIVATIE
       → VS Code Output → "Smart Router" channel aanwezig
       → Geen activatie errors in Output channel
       → smart.validateSystem → "ProactiveValidator: 0 issues"

[ ] 2. ROUTING PIPELINE
       → smart.openChat → Chat Panel opent (geen blank screen)
       → Stuur test bericht "hello" → response ontvangen (niet timeout)
       → Stuur "write a function" → model = qwen/qwen3-235b-a22b (code_gen)
       → Stuur "debug this error" → model = minimax/minimax-m2.5 (debug)
       → Stuur "design architecture" → model = qwen/qwen3-235b-a22b (architecture)

[ ] 3. OPENROUTER CONNECTIE
       → smart.showHealth → alle routing modellen "available"
       → Geen "Language model unavailable" errors
       → API key geldig (geen 401 responses in Output)

[ ] 4. ROO CODE INTEGRATIE
       → smart.showRooCodeStatus → "Roo Code v3.48.0 detected"
       → smart.delegateToRooCode → geen crash
       → ROO_CODE_MODELS lijst correct in Output

[ ] 5. DAILY EVALUATOR
       → smart.runDailyEval → Output toont evaluatie resultaat
       → WATCHLIST.md datum bijgewerkt (als 1e run van de dag)
       → Geen unhandled promise rejections in Output

[ ] 6. COST TRACKING
       → smart.showCosts → tabel met model kosten zichtbaar
       → smart.showCostPredictions → prognose zichtbaar
       → Geen NaN of undefined in kostentabel

[ ] 7. COMMANDS VOLLEDIGHEID
       → Ctrl+Shift+P → typ "Smart Router" → alle 19 commands zichtbaar
       → Geen commands die crashen bij aanroepen

[ ] 8. VERSIE CONSISTENTIE
       → package.json version === extension.ts VERSION constante
       → SMART_ROUTER_ANALYSIS_OPTIMIZED.md changelog bevat huidige versie
       → WATCHLIST.md "Laatste update" = vandaag (na DailyEvaluator)

[ ] 9. MODEL ID VALIDATIE
       → validate-smart-router.js (zodra gebouwd) → 0 warnings
       → Alle model IDs in models.ts gebruiken dot-notatie (4.6 niet 4-6)
       → Geen model IDs die niet op OpenRouter bestaan

[ ] 10. REGRESSIE — VORIGE VERSIE FEATURES
        → Features uit vorige versie nog steeds werkend
        → Geen nieuwe "Language model unavailable" errors
        → Performance: response tijd < 30s voor standaard queries
```

**Resultaat:** alle 10 checks groen = versie mag naar changelog als `verified`.

### E2E Integratie in deploy workflow

```bash
# Volledige deploy + test workflow:

# Stap 0: Validate (statisch)
node scripts/validate-smart-router.js   # exit 1 bij elke warning

# Stap 1: Compileer
npx tsc -p ./

# Stap 2: Deploy
node deploy_ext.js
cmd /c "rmdir /s /q C:\Users\Gebruiker\.vscode\extensions\universal-vibe.smart-router-2.7.0\node_modules"

# Stap 3: Documentatie (automatisch)
node scripts/update-changelog.js        # PROJECT_README.md + WATCHLIST.md

# Stap 4: Reload
# Ctrl+Shift+P → Developer: Reload Window

# Stap 5: E2E test (handmatig — zie checklist hierboven)
# Doorloop alle 10 checks
# Pas na groen: git commit + push
```

### Wanneer E2E test verplicht is

| Situatie | E2E verplicht? |
|---|---|
| Nieuwe model toegevoegd aan routing | ✅ Ja — check [2] routing pipeline |
| DailyEvaluator logica gewijzigd | ✅ Ja — check [5] daily evaluator |
| Nieuwe command geregistreerd | ✅ Ja — check [7] commands volledigheid |
| Alleen documentatie bijgewerkt | ❌ Nee |
| package.json versie bump | ✅ Ja — check [8] versie consistentie |
| OpenRouter model ID gewijzigd | ✅ Ja — check [3] + [9] |

---

## 📊 Competitive Intelligence

| Concurrent | Usage | Smart Router voordeel |
|---|---|---|
| Cline | 1.67M | Roo Code integratie + cost tracking |
| liteLLM | 1.43M | VS Code native + webview panel |
| BLACKBOXAI | 1.28M | OpenRouter multi-model routing |

---

## 📚 Externe Expert Bronnen

*Zie [EXTERNE_BRONNEN.md](./EXTERNE_BRONNEN.md) voor volledige expert monitoring en integratie.*

### 🎯 Primaire Expert: @LLMJunky (am.will)

**Expertise:** AI model routing, cost optimization, market intelligence
**Platform:** X (Twitter) - @LLMJunky
**Focus:** OpenAI Codex, local models, cost analysis, model rankings

**Kernimpact:**
- **Kostenbesparing:** $15.45 per 1M tokens bespaard
- **Model Selectie:** Rankings bepalen routing keuzes
- **Innovatie:** Inzichten inspireren nieuwe features
- **Competitie:** Monitoring houdt ons voorop concurrenten

---

### Context
Volledige kwaliteitsslag op HECO tooling: WERKPLAN.md herschreven, selfcheck.js verbeterd, Monitor v0.8.9 gebouwd. Aanleiding: WERKPLAN liep weken achter en warnings werden geaccepteerd.

### Kernlessen

| Fout | Impact | Fix | Toepassing Smart Router |
|---|---|---|---|
| Documentatie bijwerken = 2 regels aanpassen | Plan liep weken achter op realiteit | `update-werkplan.js` automatisch in build | `validate-smart-router.js` moet ook docs-currency checken |
| Elke warning is er 1 teveel | Verkeerde node ID weken geaccepteerd | 0 warnings als harde eis | Smart Router validator: exit 1 bij elke warning |
| Hardcoded versienummers in validators | Validator faalde na elke versie-bump | `detectNewest()` auto-detect | Validator moet versie uit `package.json` lezen, niet hardcoden |
| Naam van component weken verkeerd | ui_template noemde v0.8.4 terwijl flow v0.8.8 was | Build script fix | Commands in `package.json` moeten versie matchen met `extension.ts` |

### Structurele fix: automatische documentatie

HECO heeft nu `update-werkplan.js` — een module die vanuit elk build script als **laatste stap** automatisch het werkplan bijwerkt. Resultaat: documentatie is een output van het build proces, niet een handmatige stap.

**Directe les voor Smart Router v2.8.0:**
- Voeg `update-changelog.js` toe aan deploy workflow (analoog aan `update-werkplan.js`)
- `PROJECT_README.md` changelog sectie automatisch bijwerken na elke deploy
- `WATCHLIST.md` datum automatisch bijwerken na elke `DailyEvaluator` run

**Deploy workflow update (v2.8.0):**

```bash
# Stap 0: Validate (nieuw)
node scripts/validate-smart-router.js   # exit 1 bij elke warning
# Stap 1: Compileer
npx tsc -p ./
# Stap 2: Deploy
node deploy_ext.js
# Stap 3: Documentatie bijwerken (nieuw — automatisch)
node scripts/update-changelog.js        # PROJECT_README.md + WATCHLIST.md
# Stap 4: Reload
# Ctrl+Shift+P → Developer: Reload Window
```

---

## 🧠 Leermomenten — 19 februari 2026 (HECO debugging sessie)

### Context
Lange debugging sessie op HECO Node-RED flows (Monitor + Optimizer). Cascade als pair programmer via Windsurf. Resultaat: Monitor v0.8.7 + Optimizer v1.2.6, beide 100% validator compliant.

### Cascade werkprotocol verbeteringen

**Wat structureel fout ging:**

| Fout | Impact | Fix |
|---|---|---|
| Geen wire-graph reachability check | 7 versies nodig i.p.v. 2 | BFS check na elke flow wijziging |
| Originele flow aangenomen als correct | Missers zaten al in v1.2.0 | Altijd baseline validatie draaien |
| Spec docs niet gelezen bij sessiestart | Fixes niet conform requirements | Begin met `user-requirements.json` lezen |
| Validator pas aan het einde ontdekt | Tibber tekst fout al in v1.2.2 | `validate-all.js` na elke versie |

**Nieuw verplicht protocol bij HECO sessies:**
```
BEGIN: lees user-requirements.json + draai validate-all.js baseline
FIX:   schrijf node fix_vX.Y.Z.js → draai → valideer → commit → verwijder script
CHECK: wire-graph BFS reachability na elke structuurwijziging
```

### Cascade als Windsurf tool — observaties

**Sterk:**
- JSON manipulatie via Node.js scripts betrouwbaarder dan PowerShell string replacement
- BFS wire-graph analyse in één node commando — snel en volledig
- Validator als poortwachter werkt goed (139 checks Optimizer)

**Zwak:**
- Workspace scope beperking: kan niet zoeken buiten de twee actieve workspaces
- PowerShell multiline string escaping is fragiel — vermijden voor JSON edits
- Geen live Node-RED toegang — kan flows niet live testen, alleen JSON analyseren

**Windsurf vs Claude Code:**
- Windsurf/Cascade: beter voor iteratieve debugging, file manipulatie, git workflow
- Claude Code: beter voor initiële flow generatie (heeft bash + volledige filesystem toegang)
- Combinatie ideaal: Claude Code genereert → Cascade debugt en verfijnt

### Toepassing op Smart Router development

**Directe lessen voor v2.8.0:**
- Schrijf een `validate-smart-router.js` script (analoog aan HECO's validate-all.js) voor automatische checks vóór deploy
- Gebruik node.js scripts voor package.json/tsconfig manipulatie i.p.v. PowerShell
- Voeg reachability check toe voor command registraties: zijn alle commands in `package.json` ook geregistreerd in `extension.ts`?

**Deploy workflow update:**
```bash
# Voeg toe als stap 0:
node scripts/validate-smart-router.js   # nog te bouwen
npx tsc -p ./
node deploy_ext.js
# Reload Window
```

---

*Smart Router v2.7.0 — AI model routing + Roo Code integratie + dagelijkse markt monitoring*
