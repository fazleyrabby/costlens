import type { Period, ProviderAdapter, ProviderConfig, ProviderUsage } from "./types";
import { emptyUsage } from "./http";

// Antigravity uses OAuth ("auth login"). Flow:
// 1. Exchange ANTIGRAVITY_REFRESH_TOKEN for an access token (token endpoint TBD).
// 2. Call the usage endpoint with the access token.
// TODO: confirm token endpoint + usage endpoint, implement getAccessToken() and
// fetch/normalize to ModelUsage[] / UsageLimit[].
export const antigravity: ProviderAdapter = {
  id: "antigravity",
  async fetchUsage(cfg: ProviderConfig, _period: Period): Promise<ProviderUsage> {
    return emptyUsage(cfg, "adapter stub — TODO: implement Antigravity OAuth + usage API");
  },
};
