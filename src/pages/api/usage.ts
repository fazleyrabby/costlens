import type { APIRoute } from "astro";
import { cachedFetchAll } from "../../providers";
import { loadProviderConfigs } from "../../config/providers";
import { aggregate } from "../../lib/aggregate";

export const GET: APIRoute = async ({ url }) => {
  const periodParam = url.searchParams.get("period") || "30d";
  const now = new Date();
  let from: string | undefined;

  if (periodParam === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    from = d.toISOString();
  } else if (periodParam === "7d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    from = d.toISOString();
  } else if (periodParam === "30d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    from = d.toISOString();
  }

  const configs = loadProviderConfigs();
  const period = { from, to: now.toISOString() };
  const providers = await cachedFetchAll(configs, period);
  const data = aggregate(providers, periodParam);
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
};
