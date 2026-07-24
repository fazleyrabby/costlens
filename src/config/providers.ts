import "dotenv/config";
import type { ProviderConfig } from "../providers/types";

// Reads credentials from environment. A provider is "enabled" only when its
// required credential is present, so .env controls what gets queried.
export function loadProviderConfigs(): ProviderConfig[] {
  const e = process.env;
  const defs: ProviderConfig[] = [
    {
      id: "openrouter",
      name: "OpenRouter",
      type: "apikey",
      apiKey: e.OPENROUTER_KEY,
      baseUrl: "https://openrouter.ai/api/v1",
      enabled: !!e.OPENROUTER_KEY,
    },
    {
      id: "groq",
      name: "Groq",
      type: "apikey",
      apiKey: e.GROQ_KEY,
      baseUrl: "https://api.groq.com",
      enabled: !!e.GROQ_KEY,
    },
    {
      id: "deepseek",
      name: "DeepSeek",
      type: "apikey",
      apiKey: e.DEEPSEEK_KEY,
      baseUrl: "https://api.deepseek.com",
      enabled: !!e.DEEPSEEK_KEY,
    },
    {
      id: "nous",
      name: "Nous",
      type: "apikey",
      apiKey: e.NOUS_KEY,
      enabled: !!e.NOUS_KEY,
    },
    {
      id: "opencode",
      name: "OpenCode",
      type: "token",
      token: e.OPENCODE_TOKEN,
      enabled: !!e.OPENCODE_TOKEN,
    },
    {
      id: "antigravity",
      name: "Antigravity",
      type: "oauth",
      clientId: e.ANTIGRAVITY_CLIENT_ID,
      clientSecret: e.ANTIGRAVITY_CLIENT_SECRET,
      refreshToken: e.ANTIGRAVITY_REFRESH_TOKEN,
      enabled: !!e.ANTIGRAVITY_REFRESH_TOKEN,
    },
    {
      id: "codex",
      name: "Codex",
      type: "oauth",
      refreshToken: e.CODEX_TOKEN || "codex-oauth-session",
      enabled: true,
    },
    {
      id: "claudecode",
      name: "Claude Code",
      type: "oauth",
      refreshToken: e.CLAUDECODE_TOKEN || "claudecode-oauth-session",
      enabled: true,
    },
  ];
  return defs.filter((d) => d.enabled);
}
