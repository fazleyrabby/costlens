import type { Period, ProviderAdapter, ProviderConfig, ProviderUsage } from "./types";
import { emptyUsage } from "./http";

// OpenCode usage: sourced from OpenCode's locally stored token/usage data
// (e.g. a local DB or exported JSON), not a hosted API. The token key in
// OPENCODE_TOKEN may authenticate a local or hosted usage export.
// TODO: decide source (local file/export) and implement fetch + normalize.
export const opencode: ProviderAdapter = {
  id: "opencode",
  async fetchUsage(cfg: ProviderConfig, _period: Period): Promise<ProviderUsage> {
    return emptyUsage(cfg, "adapter stub — TODO: implement OpenCode usage source");
  },
};
