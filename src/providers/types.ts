export interface ModelUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  cost: number;
}

export interface UsageLimit {
  label: string; // e.g. "Daily spend", "Requests"
  used: number;
  limit: number | null; // null = unlimited / unknown
  unit: string; // "USD" | "requests" | ...
  resetAt?: string; // ISO timestamp
}

export interface ProviderUsage {
  id: string;
  name: string;
  ok: boolean;
  error?: string;
  note?: string; // informational, e.g. "adapter stub"
  currency: string;
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  byModel: ModelUsage[];
  limits: UsageLimit[];
  period?: { from?: string; to?: string };
}

export interface Period {
  from?: string; // ISO
  to?: string; // ISO
}

export type AuthType = "apikey" | "token" | "oauth";

export interface ProviderConfig {
  id: string;
  name: string;
  type: AuthType;
  enabled: boolean;
  apiKey?: string;
  token?: string;
  baseUrl?: string;
  // oauth
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  accessToken?: string;
}

export interface ProviderAdapter {
  id: string;
  fetchUsage(cfg: ProviderConfig, period: Period): Promise<ProviderUsage>;
}

export interface AggregateUsage {
  generatedAt: string;
  providers: ProviderUsage[];
  totals: {
    cost: number;
    inputTokens: number;
    outputTokens: number;
    mostUsedModels: ModelUsage[];
  };
}
