import type { ProviderConfig, ProviderUsage } from "./types";

export async function fetchJson(
  url: string,
  opts: { headers?: Record<string, string>; timeoutMs?: number } = {},
): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 15000);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", ...(opts.headers ?? {}) },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export function errorUsage(cfg: ProviderConfig, e: unknown): ProviderUsage {
  return {
    id: cfg.id,
    name: cfg.name,
    ok: false,
    error: e instanceof Error ? e.message : String(e),
    currency: "USD",
    totalCost: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    byModel: [],
    limits: [],
  };
}

export function emptyUsage(
  cfg: ProviderConfig,
  note?: string,
): ProviderUsage {
  return {
    id: cfg.id,
    name: cfg.name,
    ok: true,
    note,
    currency: "USD",
    totalCost: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    byModel: [],
    limits: [],
  };
}
