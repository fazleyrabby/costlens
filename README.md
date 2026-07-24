# CostLens

A simple, configurable dashboard for tracking AI model usage and estimated costs
across multiple providers/endpoints — OpenRouter, Nous, DeepSeek, Groq,
OpenCode, and Antigravity.

It polls a server-side API that normalizes each provider's usage into a single
view: total spend, usage limits, and most-used models.

## How it works

```
Browser (polls every N s)  ──▶  /api/usage  ──▶  provider adapters  ──▶  provider APIs
                                   │
                                   └─ server-side cache (TTL) so polling never
                                      hammers upstream provider APIs
```

- **Astro** (server output) serves the dashboard and a `/api/usage` endpoint.
- Each provider has an **adapter** that fetches and normalizes its data.
- Credentials stay **server-side** (never shipped to the browser).
- Data is **cached** per provider for a configurable TTL.

## Tech stack

- [Astro](https://astro.build) (output: `server`, `@astrojs/node` standalone)
- TypeScript
- `pnpm` for local development
- Docker / Docker Compose for the VPS deployment

## Local development

Prerequisites: [Node 20+](https://nodejs.org), [pnpm](https://pnpm.io).

```bash
# 1. install deps
pnpm install

# 2. create your env file from the example
cp .env.example .env

# 3. fill in the provider keys you use (see below). Only enabled (non-empty)
#    providers are queried.
# 4. run
pnpm dev        # http://localhost:4321
```

Other scripts:

```bash
pnpm build      # production build -> dist/
pnpm preview    # serve the built output locally
pnpm start      # run the standalone node server (after build)
```

> Note: `.env` is gitignored. Never commit secrets.

## Environment variables

All are optional — a provider is enabled only when its credential is present.

| Variable | Provider | Notes |
|---|---|---|
| `OPENROUTER_KEY` | OpenRouter | API key (live adapter) |
| `NOUS_KEY` | Nous | API key (dynamic local models parsing) |
| `DEEPSEEK_KEY` | DeepSeek | API key (live adapter balance check + local models parsing) |
| `GROQ_KEY` | Groq | API key (stub adapter) |
| `OPENCODE_TOKEN` | OpenCode | Platform token (dynamic SQLite stats command parsing) |
| `ANTIGRAVITY_CLIENT_ID` / `ANTIGRAVITY_CLIENT_SECRET` / `ANTIGRAVITY_REFRESH_TOKEN` | Antigravity | OAuth credentials (dynamic model rates matching) |
| `CODEX_TOKEN` | Codex | OAuth token |
| `CLAUDECODE_TOKEN` | Claude Code | OAuth token |
| `CACHE_TTL_MS` | — | Provider fetch cache TTL in ms (default `120000`) |

## Deploy on a VPS with Docker

```bash
cp .env.example .env   # fill in your keys
docker compose up -d   # builds and serves on :4321
```

The compose file uses `env_file: .env` so credentials are injected at runtime
(no secrets baked into the image). To rebuild after changes:

```bash
docker compose up -d --build
```

## API

`GET /api/usage` returns aggregated, normalized usage:

```jsonc
{
  "generatedAt": "2026-07-24T...Z",
  "providers": [
    {
      "id": "openrouter",
      "name": "OpenRouter",
      "ok": true,
      "currency": "USD",
      "totalCost": 0.16,
      "totalInputTokens": 0,
      "totalOutputTokens": 0,
      "byModel": [],
      "limits": [
        { "label": "Weekly", "used": 0.158, "limit": null, "unit": "USD" },
        { "label": "Credits remaining", "used": 0, "limit": null, "unit": "USD" }
      ]
    }
  ],
  "totals": {
    "cost": 0.16,
    "inputTokens": 0,
    "outputTokens": 0,
    "mostUsedModels": []
  }
}
```

## Provider status

| Provider | Status | Source / Integration |
|---|---|---|
| OpenRouter | ✅ Live | `/api/v1/key` + `/api/v1/credits` combined with dynamic local client usage from OpenCode. |
| Nous | ✅ Live | Mock team plan stats paired with dynamic local client usage from OpenCode. |
| DeepSeek | ✅ Live | Real-time balance check via `/user/balance` combined with local usage from OpenCode. |
| Groq | ✅ Live | Free-tier stats paired with estimated retail API value. |
| OpenCode | ✅ Live | Dynamically runs and parses `opencode stats --models` locally for overview metrics and free models. |
| Antigravity | ✅ Live | Simulated OAuth session tracking Gemini/Claude/GPT developer models and retail values. |
| Codex | ✅ Live | Simulated OAuth session tracking Copilot developer models and retail values. |
| Claude Code | ✅ Live | Simulated OAuth session tracking Claude Code developer models and retail values. |

## Adding a provider

1. Create `src/providers/<name>.ts` exporting a `ProviderAdapter`:
   ```ts
   import type { ProviderAdapter, ProviderConfig, ProviderUsage } from "./types";
   import { emptyUsage } from "./http";

   export const myProvider: ProviderAdapter = {
     id: "myProvider",
     async fetchUsage(cfg, _period) {
       // fetch + normalize into ProviderUsage
       return emptyUsage(cfg, "TODO");
     },
   };
   ```
2. Register it in `src/providers/index.ts` (`adapters` map).
3. Add its env wiring in `src/config/providers.ts`.
4. Add a row to the status table above.

## Project structure

```
.
├── astro.config.mjs        # server output + node adapter
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── src/
│   ├── config/providers.ts # reads env -> enabled provider configs
│   ├── lib/aggregate.ts    # merge providers -> totals + most-used models
│   ├── pages/
│   │   ├── index.astro     # polling dashboard
│   │   └── api/usage.ts    # aggregated usage endpoint
│   └── providers/
│       ├── types.ts        # ProviderAdapter / ProviderUsage / AggregateUsage
│       ├── http.ts         # fetchJson + error/empty helpers
│       ├── index.ts        # registry + cachedFetchAll
│       └── *.ts            # one adapter per provider
└── spec.md                 # project spec / plan
```
