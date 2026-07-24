import type { Period, ProviderAdapter, ProviderConfig, ProviderUsage } from "./types";
import { emptyUsage } from "./http";

// TODO: Groq has no public usage API equivalent to OpenRouter.
// Candidate: console/export endpoint or OpenAI-compatible /v1/usage (unverified).
// Implement fetch + normalize mapping to ModelUsage[] and UsageLimit[] here.
export const groq: ProviderAdapter = {
  id: "groq",
  async fetchUsage(cfg: ProviderConfig, _period: Period): Promise<ProviderUsage> {
    return emptyUsage(cfg, "adapter stub — TODO: implement Groq usage API");
  },
};
