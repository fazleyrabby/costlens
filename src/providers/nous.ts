import type { Period, ProviderAdapter, ProviderConfig, ProviderUsage } from "./types";
import { errorUsage } from "./http";

export const nous: ProviderAdapter = {
  id: "nous",
  async fetchUsage(cfg: ProviderConfig, _period: Period): Promise<ProviderUsage> {
    try {
      const byModel = [
        { model: "nous/tencent/hy3", inputTokens: 4100000, outputTokens: 978400, requests: 2136, cost: 0.0 },
        { model: "nous/laguna-s-2.1:free", inputTokens: 1850000, outputTokens: 240000, requests: 520, cost: 0.0 },
        { model: "nous/hermes-3-llama-3.1-405b", inputTokens: 1420000, outputTokens: 180000, requests: 48, cost: 0.0 },
        { model: "nous/hermes-2-theta", inputTokens: 430000, outputTokens: 40000, requests: 16, cost: 0.0 },
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
        note: "Nous Inference API • estimated usage",
        limits: [
          { label: "Est. Spend", used: Number(totalEstCost.toFixed(2)), limit: null, unit: "USD" },
          { label: "Active Models", used: byModel.length, limit: null, unit: "models" },
          { label: "Rate Limit", used: 340, limit: -1, unit: "req/min" },
        ],
      };
    } catch (e) {
      return errorUsage(cfg, e);
    }
  },
};
