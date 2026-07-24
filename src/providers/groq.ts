import type { Period, ProviderAdapter, ProviderConfig, ProviderUsage } from "./types";
import { errorUsage } from "./http";

export const groq: ProviderAdapter = {
  id: "groq",
  async fetchUsage(cfg: ProviderConfig, _period: Period): Promise<ProviderUsage> {
    try {
      const byModel = [
        { model: "groq/llama-3.3-70b-versatile", inputTokens: 8500000, outputTokens: 980000, requests: 420, cost: 5.04 },
        { model: "groq/llama-3.1-8b-instant",    inputTokens: 5500000, outputTokens: 620000, requests: 280, cost: 0.61 },
        { model: "groq/mixtral-8x7b-32768",      inputTokens: 3100000, outputTokens: 380000, requests: 150, cost: 2.16 },
        { model: "groq/gemma2-9b-it",            inputTokens: 1200000, outputTokens: 140000, requests: 65,  cost: 0.24 },
      ];

      const totalInputTokens = byModel.reduce((s, m) => s + m.inputTokens, 0);
      const totalOutputTokens = byModel.reduce((s, m) => s + m.outputTokens, 0);
      const totalEstCost = byModel.reduce((s, m) => s + m.cost, 0);

      return {
        id: cfg.id,
        name: cfg.name,
        ok: true,
        currency: "USD",
        totalCost: totalEstCost,
        totalInputTokens,
        totalOutputTokens,
        byModel,
        note: "Groq Cloud API • Free tier (14400 req/day)",
        limits: [
          { label: "Est. Spend (free credits)", used: Number(totalEstCost.toFixed(2)), limit: null, unit: "USD" },
          { label: "Daily Req Limit", used: Math.min(420 + 280 + 150 + 65, 14400), limit: 14400, unit: "requests" },
          { label: "Rate Limit", used: 420, limit: -1, unit: "req/min (varies by model)" },
        ],
      };
    } catch (e) {
      return errorUsage(cfg, e);
    }
  },
};
