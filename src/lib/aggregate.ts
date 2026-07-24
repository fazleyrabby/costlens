import type { AggregateUsage, ModelUsage, ProviderUsage } from "../providers/types";

export function aggregate(providers: ProviderUsage[]): AggregateUsage {
  const modelMap = new Map<string, ModelUsage>();

  let cost = 0;
  let inputTokens = 0;
  let outputTokens = 0;

  for (const p of providers) {
    if (!p.ok) continue;
    cost += p.totalCost;
    inputTokens += p.totalInputTokens;
    outputTokens += p.totalOutputTokens;
    for (const m of p.byModel) {
      const ex = modelMap.get(m.model);
      if (ex) {
        ex.inputTokens += m.inputTokens;
        ex.outputTokens += m.outputTokens;
        ex.requests += m.requests;
        ex.cost += m.cost;
      } else {
        modelMap.set(m.model, { ...m });
      }
    }
  }

  const mostUsedModels = [...modelMap.values()]
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  return {
    generatedAt: new Date().toISOString(),
    providers,
    totals: { cost, inputTokens, outputTokens, mostUsedModels },
  };
}
