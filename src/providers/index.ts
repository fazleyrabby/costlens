import type { Period, ProviderAdapter, ProviderConfig, ProviderUsage } from "./types";
import { errorUsage } from "./http";

const TTL_MS = Number(process.env.CACHE_TTL_MS ?? 120_000);
const cache = new Map<string, { value: ProviderUsage; expires: number }>();

// Cached variant: each provider is refreshed independently only when its
// cache entry expires, so client polling never hammers upstream APIs.
export async function cachedFetchAll(
  configs: ProviderConfig[],
  period: Period,
): Promise<ProviderUsage[]> {
  const now = Date.now();
  return Promise.all(
    configs.map(async (cfg) => {
      const cacheKey = `${cfg.id}:${period.from || "all"}:${period.to || "now"}`;
      const hit = cache.get(cacheKey);
      if (hit && hit.expires > now) return hit.value;
      const adapter = adapters[cfg.id];
      const value = adapter
        ? await adapter.fetchUsage(cfg, period)
        : errorUsage(cfg, `no adapter registered for "${cfg.id}"`);
      cache.set(cacheKey, { value, expires: now + TTL_MS });
      return value;
    }),
  );
}
import { openrouter } from "./openrouter";
import { groq } from "./groq";
import { deepseek } from "./deepseek";
import { nous } from "./nous";
import { opencode } from "./opencode";
import { antigravity } from "./antigravity";
import { codex } from "./codex";
import { claudecode } from "./claudecode";

export const adapters: Record<string, ProviderAdapter> = {
  openrouter,
  groq,
  deepseek,
  nous,
  opencode,
  antigravity,
  codex,
  claudecode,
};

export async function fetchAll(
  configs: ProviderConfig[],
  period: Period,
): Promise<ProviderUsage[]> {
  return Promise.all(
    configs.map(async (cfg) => {
      const adapter = adapters[cfg.id];
      if (!adapter) return errorUsage(cfg, `no adapter registered for "${cfg.id}"`);
      return adapter.fetchUsage(cfg, period);
    }),
  );
}
