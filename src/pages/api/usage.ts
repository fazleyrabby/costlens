import type { APIRoute } from "astro";
import { cachedFetchAll } from "../../providers";
import { loadProviderConfigs } from "../../config/providers";
import { aggregate } from "../../lib/aggregate";

export const GET: APIRoute = async () => {
  const configs = loadProviderConfigs();
  const period = { to: new Date().toISOString() };
  const providers = await cachedFetchAll(configs, period);
  const data = aggregate(providers);
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
};
