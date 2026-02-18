# Smart Router - Cascade/Windsurf Project Context

> Dit bestand wordt automatisch geladen door Windsurf/Cascade als projectcontext.
> Lees dit bij elke sessie zodat je volledige context hebt van het project.

---

## Project: Smart Router v2.7.0

**Type:** VS Code extensie (TypeScript)
**Doel:** Automatische AI model routing op basis van intent classificatie, zonder GitHub Copilot vereiste
**Locatie:** `C:\Dev\smart-router-v2.0.0\`
**GitHub:** https://github.com/universal-vibe/smart-router
**Deploy target:** `C:\Users\Gebruiker\.vscode\extensions\universal-vibe.smart-router-2.7.0\`

---

## Werkwijze

### Ontwikkeling
- **Windsurf/Cascade** = primary development omgeving (hier)
- **VS Code** = alleen voor extensie testen (commands uitvoeren)
- Alle code schrijven en committen vanuit Windsurf

### Deploy workflow (na elke code wijziging)
```bash
npx tsc -p ./
node deploy_ext.js
cmd /c "rmdir /s /q C:\Users\Gebruiker\.vscode\extensions\universal-vibe.smart-router-2.7.0\node_modules"
# Dan in VS Code: Ctrl+Shift+P → Developer: Reload Window
```

### Dagelijkse monitoring
- `DailyEvaluator` draait automatisch bij VS Code startup (1x per dag)
- Checkt OpenRouter op nieuwe/verdwenen modellen
- Update `WATCHLIST.md` en werkplan automatisch
- Handmatig: `Ctrl+Shift+P` → **Smart Router: Run Daily Evaluation Now**

---

## Kernbestanden

| Bestand | Doel |
|---|---|
| `src/extension.ts` | Entry point, alle commands registreren |
| `src/models.ts` | MODEL_ROUTING + ARENA_BATTLE_GROUPS |
| `src/classifier.ts` | Intent classificatie |
| `src/openrouter.ts` | OpenRouter API client |
| `src/proactiveValidator.ts` | Systeem health check bij startup |
| `src/dailyEvaluator.ts` | Dagelijkse automatische model monitoring |
| `src/smartRouterPanel.ts` | Webview chat panel (geen Copilot nodig) |
| `src/rooCodeBridge.ts` | Roo Code integratie |
| `src/logger.ts` | Logger singleton — gebruik `Logger.getInstance().info()` |
| `SMART_ROUTER_ANALYSIS_OPTIMIZED.md` | Volledig werkplan + roadmap |
| `WATCHLIST.md` | Dagelijkse monitoring van nieuwe AI modellen |

---

## Actieve routing (geverifieerd op OpenRouter)

| Intent | Model | Context | Kosten |
|---|---|---|---|
| `simple` | `xiaomi/mimo-v2-flash` | 4K | FREE |
| `code_gen` | `qwen/qwen3-235b-a22b` | 8K | FREE |
| `debug` | `minimax/minimax-m2.5` | 8K | $0.28 |
| `architecture` | `qwen/qwen3-235b-a22b` | 8K | FREE |
| `architecture_screening` | `qwen/qwen3-235b-a22b` | 8K | FREE |
| `architecture_screening_alt` | `qwen/qwen3.5-397b-a17b` | 262K | $0.36 |
| `architecture_premium` | `anthropic/claude-opus-4.6` | 1M | $5.00 |
| `roo_code_gen` | `anthropic/claude-haiku-4.5` | 200K | $0.80 |
| `roo_architect` | `anthropic/claude-sonnet-4.6` | 1M | $3.00 |
| `roo_debug` | `google/gemini-2.0-flash-001` | 1M | $0.10 |
| `roo_premium` | `anthropic/claude-opus-4.6` | 1M | $15.00 |

---

## Bekende limitaties

| Limitatie | Oorzaak | Workaround |
|---|---|---|
| `@smart` → "Language model unavailable" | VS Code Chat vereist GitHub Copilot | Gebruik `smart.openChat` panel |
| `claude-haiku-4.6` bestaat niet | Anthropic heeft geen 4.6 haiku uitgebracht | `claude-haiku-4.5` is correct |
| Ling-2.5-1T / Ring-2.5-1T niet beschikbaar | Nog niet op OpenRouter | WATCHLIST, dagelijks gecheckt |

---

## Kritieke regels

1. **Logger:** altijd `Logger.getInstance().info()` — NOOIT `Logger.log()`
2. **Model IDs:** altijd dot-notatie (`4.6` niet `4-6`)
3. **Versiefilter:** DailyEvaluator rapporteert alleen modellen nieuwer dan huidige max (4.6)
4. **Na elke sessie:** git commit + push naar GitHub
5. **WATCHLIST.md:** dagelijks checken op nieuwe modellen

---

## Roadmap

### v2.8.0 (volgende sprint)
- Nieuwe routing intents: `computer_use`, `reasoning`, `ultra_long`, `multimodal`
- Agent Marketplace
- Dynamic model updates op basis van OpenRouter rankings

### Watchlist prioriteit
1. `inclusionAI/Ling-2.5-1T` → `debug` routing (75% goedkoper)
2. `inclusionAI/Ring-2.5-1T` → `reasoning` intent
3. `qwen/qwen3-max-thinking` → `architecture_premium` alternatief
4. `qwen/qwen3-coder-next` → `code_gen` upgrade

---

## Changelog vandaag (18 feb 2026)

- ✅ Chat Panel zonder Copilot (`smart.openChat`)
- ✅ Model IDs dot-notatie fix (4.6)
- ✅ Claude Sonnet 4.6 1M context
- ✅ DailyEvaluator: automatische dagelijkse monitoring
- ✅ Auto routing update bij WATCHLIST hit
- ✅ Auto git commit na wijzigingen
- ✅ Versiefilter: alleen modellen nieuwer dan 4.6 rapporteren
- ✅ 3 unavailable models vervangen (glm-4-32b, gpt-5.3-codex, gemini-3-flash)
