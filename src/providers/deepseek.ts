import type { Period, ProviderAdapter, ProviderConfig, ProviderUsage } from "./types";
import { emptyUsage } from "./http";

// TODO: DeepSeek exposes GET /user/balance (granted/topped-up balance) but not
// per-model usage via API. Implement usage fetch + normalize, plus balance as a
// UsageLimit if desired.
export const deepseek: ProviderAdapter = {
  id: "deepseek",
  async fetchUsage(cfg: ProviderConfig, _period: Period): Promise<ProviderUsage> {
    return emptyUsage(cfg, "adapter stub — TODO: implement DeepSeek usage API");
  },
};
