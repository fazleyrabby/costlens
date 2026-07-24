import type { Period, ProviderAdapter, ProviderConfig, ProviderUsage } from "./types";
import { emptyUsage } from "./http";

// TODO: Nous platform usage endpoint is unknown. Add baseUrl + fetch + normalize
// once the API shape is confirmed.
export const nous: ProviderAdapter = {
  id: "nous",
  async fetchUsage(cfg: ProviderConfig, _period: Period): Promise<ProviderUsage> {
    return emptyUsage(cfg, "adapter stub — TODO: implement Nous usage API");
  },
};
