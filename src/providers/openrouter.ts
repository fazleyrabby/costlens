import type {
  Period,
  ProviderAdapter,
  ProviderConfig,
  ProviderUsage,
  UsageLimit,
} from "./types";
import { errorUsage, fetchJson } from "./http";

const BASE = "https://openrouter.ai/api/v1";

// OpenRouter live endpoints:
//  GET /api/v1/key     -> usage (total/daily/weekly/monthly), limit, rate info
//  GET /api/v1/credits -> total_credits, total_usage (for remaining balance)
// Note: the older per-model /api/v1/usage endpoint is no longer available,
// so we report aggregate spend + period usage as limits.
export const openrouter: ProviderAdapter = {
  id: "openrouter",
  async fetchUsage(cfg: ProviderConfig, _period: Period): Promise<ProviderUsage> {
    const auth = { Authorization: `Bearer ${cfg.apiKey}` };
    try {
      const [keyRes, creditRes] = await Promise.all([
        fetchJson(`${BASE}/key`, { headers: auth }),
        fetchJson(`${BASE}/credits`, { headers: auth }).catch(() => null),
      ]);

      const k = keyRes?.data ?? {};
      const credits = creditRes?.data ?? {};
      const totalCredits = Number(credits.total_credits ?? 0);
      const totalUsage = Number(credits.total_usage ?? k.usage ?? 0);

      const limits: UsageLimit[] = [
        { label: "Daily", used: Number(k.usage_daily ?? 0), limit: null, unit: "USD" },
        { label: "Weekly", used: Number(k.usage_weekly ?? 0), limit: null, unit: "USD" },
        { label: "Monthly", used: Number(k.usage_monthly ?? 0), limit: null, unit: "USD" },
        {
          label: "Credits remaining",
          used: Math.max(totalCredits - totalUsage, 0),
          limit: totalCredits || null,
          unit: "USD",
        },
      ];

      return {
        id: cfg.id,
        name: cfg.name,
        ok: true,
        currency: "USD",
        // lifetime spend is the most complete figure available
        totalCost: Number(k.usage ?? totalUsage),
        totalInputTokens: 0,
        totalOutputTokens: 0,
        byModel: [],
        limits,
      };
    } catch (e) {
      return errorUsage(cfg, e);
    }
  },
};
