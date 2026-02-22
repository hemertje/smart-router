# 🔭 Smart Router - AI Model Watchlist

> Proactieve monitoring van nieuwe AI modellen en releases.
> Update bij elke nieuwe release die relevant is voor routing optimalisatie.

---

## 📋 Monitoring Protocol

**Dagelijks checken:**
- [OpenRouter Models](https://openrouter.ai/models) — nieuwe model IDs
- [OpenRouter Rankings](https://openrouter.ai/rankings) — market share shifts
- [Anthropic News](https://www.anthropic.com/news) — Claude releases
- [Qwen Blog](https://qwen.ai/research) — Alibaba model updates
- [Hugging Face](https://huggingface.co/inclusionAI) — Ant Group / Ling modellen

**Bij nieuwe release:**
1. Verifieer model ID op OpenRouter (`/api/v1/models`)
2. Update `src/models.ts` routing
3. Update `src/rooCodeBridge.ts` shared models indien relevant
4. Compileer + deploy
5. Voeg toe aan **Beschikbaar** sectie hieronder

---

## ✅ Beschikbaar op OpenRouter (geïntegreerd)

| Model | OpenRouter ID | Context | Prijs input | Routing intent | Toegevoegd |
|---|---|---|---|---|---|
| Claude Sonnet 4.6 | `anthropic/claude-sonnet-4.6` | 1M | $3.00 | `roo_architect` | 18 feb 2026 |
| Claude Opus 4.6 | `anthropic/claude-opus-4.6` | 1M | $15.00 | `architecture_premium`, `roo_premium` | 18 feb 2026 |
| Qwen3.5 397B | `qwen/qwen3.5-397b-a17b` | 262K | $0.36 | `architecture_screening_alt` | 18 feb 2026 |
| Qwen3 235B | `qwen/qwen3-235b-a22b` | 8K | FREE | `code_gen`, `architecture` | 18 feb 2026 |
| GLM-4 32B | `thudm/glm-4-32b` | 128K | $0.21 | `architecture_screening` | 18 feb 2026 |
| Gemini 2.0 Flash | `google/gemini-2.0-flash-001` | — | — | validator check | 18 feb 2026 |
| MiniMax M2.5 | `minimax/minimax-m2.5` | 8K | $0.28 | `debug` | eerder |
| Mimo v2 Flash | `xiaomi/mimo-v2-flash` | 4K | FREE | `simple` | eerder |

---

## 👀 Watchlist — Nog NIET op OpenRouter

### 🐜 Ant Group — Ling 2.5 serie (16 feb 2026)
**Bron:** https://www.antgroup.com (hoofddomein scanning)
**Focus:** Ling-2.5-1T, Ring-2.5-1T, Ming-Flash-Omni-2.0

| Model | Highlight | Hugging Face | Target routing |
|---|---|---|---|
| **Ling-2.5-1T** | 1T params, 1M context, native agents. AIME 2026 met slechts 5.890 tokens (vs 15K-23K concurrenten) | `inclusionAI/Ling-2.5-1T` | `debug`, `architecture` |
| **Ring-2.5-1T** | Wereld's eerste hybrid linear-architecture thinking model. IMO 2025 Gold (35/42), CMO 2025 105/126 | `inclusionAI/Ring-2.5-1T` | `architecture_premium` alternatief |
| **Ming-Flash-Omni-2.0** | Eerste model dat speech + audio + music unificeert in één architectuur | `inclusionAI/Ming-Flash-Omni-2.0` | `image_analysis` toekomst |

**Check:** https://openrouter.ai/models → zoek op "ling" of "inclusionAI"

---

### 🇨🇳 Alibaba Qwen3.5 — Extra modellen (17 feb 2026)
**Bron:** https://www.alibaba.com (hoofddomein scanning)
**Focus:** Qwen3.5-Plus, Qwen3.5 Visual Agent

| Model | Highlight | Target routing |
|---|---|---|
| **Qwen3.5-Plus** | Budget optie, 1M context | `architecture_screening_alt` backup |
| **Qwen3.5 Visual Agent** | Desktop/mobiel app control | Toekomstige `computer_use` intent |

**Specs:** 60% goedkoper dan vorige gen, 8x betere throughput, visual agentic capabilities

---

### 🤖 Anthropic — Claude Sonnet 4.6 features (18 feb 2026)
**Bron:** https://www.anthropic.com (hoofddomein scanning)
**Focus:** Claude Sonnet 4.6, Opus 4.6, Haiku 4.5

| Feature | Status | Smart Router actie |
|---|---|---|
| 1M context window | ✅ Beta beschikbaar | `roo_architect` maxTokens = 1M ✅ |
| Computer use verbeterd | ✅ Beschikbaar | Toekomstige `computer_use` intent |
| Prompt injection resistance | ✅ Verbeterd vs Sonnet 4.5 | Veiliger voor agent taken |

---

### 🔍 Domein Scanning Protocol

**Actieve Domeinen:**
- **https://www.antgroup.com** - Ant Group AI modellen
- **https://www.alibaba.com** - Alibaba Qwen modellen  
- **https://www.anthropic.com** - Anthropic Claude modellen
- **https://openai.com** - OpenAI GPT modellen
- **https://deepseek.ai** - Deepseek modellen
- **https://qwen.ai** - Qwen modellen
- **https://www.perplexity.ai/discover** - Perplexity AI news aggregation
- **https://openrouter.ai** - OpenRouter platform updates
- **https://github.com/OpenRouterTeam** - OpenRouter GitHub releases

**Scanning Frequentie:**
- **Dagelijks:** Nieuwe artikelen en releases
- **Wekelijks:** Diepgaande analyses en updates
- **Maandelijks:** Strategische trends en shifts

**Monitoring Methode:**
- **RSS feeds** waar beschikbaar
- **News sections** op hoofddomeinen
- **Blog posts** en announcements
- **Press releases** en product updates
- **AI aggregation** via Perplexity Discover
- **Platform updates** via OpenRouter API
- **GitHub releases** via OpenRouter repository

## 📚 Externe Bronnen & Experts

*Zie [EXTERNE_BRONNEN.md](./EXTERNE_BRONNEN.md) voor volledige expert monitoring en integratie.*

### 🎯 Primaire Expert: @LLMJunky (am.will)

**Expertise:** AI model routing, cost optimization, market intelligence
**Platform:** X (Twitter) - @LLMJunky
**Focus:** OpenAI Codex, local models, cost analysis, model rankings

**Kernimpact:**
- **Kostenbesparing:** $15.45 per 1M tokens bespaard
- **Model Selectie:** Rankings bepalen routing keuzes
- **Innovatie:** Inzichten inspireren nieuwe features

---

| Intent | Beschrijving | Kandidaat modellen |
|---|---|---|
| `computer_use` | Desktop/browser automatisering | Claude Sonnet 4.6, Qwen3.5 Visual |
| `reasoning` | Wiskundige/logische problemen | Ring-2.5-1T, Ling-2.5-1T |
| `multimodal` | Beeld + audio + tekst | Ming-Flash-Omni-2.0 |
| `ultra_long` | >500K token context taken | Ling-2.5-1T (1M), Claude Sonnet 4.6 (1M) |

---

## 📅 Changelog

| Datum | Actie | Model |
|---|---|---|
| 22-2-2026 | Complete external sources integration | 6 bevinding(en) |
| 22-2-2026 | Domein scanning protocol toegevoegd | 4 bevinding(en) |
| 22-2-2026 | Externe bronnen & experts toegevoegd | 2 bevinding(en) |
| 18-2-2026 | Claude Sonnet 4.6 features toegevoegd | 1 bevinding(en) |
| 17-2-2026 | Alibaba Qwen3.5 extra modellen toegevoegd | 1 bevinding(en) |
| 16-2-2026 | Ant Group Ling 2.5 serie toegevoegd | 1 bevinding(en) | 
| 22 feb 2026 | Watchlist hits gevonden | 3 Qwen modellen nu beschikbaar |
| 18 feb 2026 | Toegevoegd aan routing | `anthropic/claude-sonnet-4.6` (1M context) |
| 18 feb 2026 | Toegevoegd aan routing | `anthropic/claude-opus-4.6` |
| 18 feb 2026 | Geüpgraded | `qwen/qwen3.5-397b-a17b` (was plus-02-15) |
| 18 feb 2026 | Model ID fix | Alle Anthropic IDs: koppelteken → punt notatie |
| 18 feb 2026 | Validator fix | `/api/v1/models` lijst ipv per-model endpoint |
