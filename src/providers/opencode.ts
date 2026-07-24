import type { Period, ProviderAdapter, ProviderConfig, ProviderUsage, ModelUsage, UsageLimit } from "./types";
import { errorUsage } from "./http";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const opencode: ProviderAdapter = {
  id: "opencode",
  async fetchUsage(cfg: ProviderConfig, _period: Period): Promise<ProviderUsage> {
    try {
      if (!cfg.token) throw new Error("Missing OpenCode platform token");

      // Execute local binary to get the stats
      const { stdout } = await execAsync("/opt/homebrew/bin/opencode stats --models");
      
      const byModel: ModelUsage[] = [];
      let totalCost = 0;
      let totalInputTokens = 0;
      let totalOutputTokens = 0;
      let sessions = 0;
      let messages = 0;
      let days = 0;

      // Parse Overview
      const overviewMatch = stdout.match(/│Sessions\s+([\d,]+)\s+│[\s\S]*?│Messages\s+([\d,]+)\s+│[\s\S]*?│Days\s+([\d,]+)\s+│/);
      if (overviewMatch) {
        sessions = parseInt(overviewMatch[1].replace(/,/g, ""));
        messages = parseInt(overviewMatch[2].replace(/,/g, ""));
        days = parseInt(overviewMatch[3].replace(/,/g, ""));
      }

      // Parse Cost & Tokens
      const costMatch = stdout.match(/│Total Cost\s+\$([\d.]+)\s+│/);
      if (costMatch) {
        totalCost = parseFloat(costMatch[1]);
      }

      // Parse Models block
      const sections = stdout.split(/├─+┤|└─+┘/);
      let inModelUsage = false;
      
      for (const sec of sections) {
        if (sec.includes("MODEL USAGE")) {
          inModelUsage = true;
          continue;
        }
        if (sec.includes("TOOL USAGE") || sec.includes("OVERVIEW") || sec.includes("COST & TOKENS")) {
          inModelUsage = false;
          continue;
        }
        if (!inModelUsage) continue;

        const lines = sec.trim().split("\n").map(l => l.replace(/│/g, "").trim());
        if (lines.length >= 5) {
          const modelName = lines[0].trim();
          if (!modelName) continue;

          // Filter out models belonging to other providers
          const lowerName = modelName.toLowerCase();
          if (
            lowerName.startsWith("deepseek/") ||
            lowerName.startsWith("nous/") ||
            lowerName.startsWith("openrouter/") ||
            lowerName.startsWith("groq/") ||
            lowerName.startsWith("antigravity/") ||
            lowerName.startsWith("codex/") ||
            lowerName.startsWith("claudecode/")
          ) {
            continue;
          }

          let msgCount = 0, inputTokens = 0, outputTokens = 0, cost = 0;
          for (const line of lines) {
            if (line.startsWith("Messages")) {
              msgCount = parseNumber(line.split(/\s+/)[1]);
            } else if (line.startsWith("Input Tokens")) {
              inputTokens = parseNumber(line.split(/\s+/)[2]);
            } else if (line.startsWith("Output Tokens")) {
              outputTokens = parseNumber(line.split(/\s+/)[2]);
            } else if (line.startsWith("Cost")) {
              cost = parseFloat(line.split(/\s+/)[1].replace("$", ""));
            }
          }

          totalInputTokens += inputTokens;
          totalOutputTokens += outputTokens;

          byModel.push({
            model: modelName,
            inputTokens,
            outputTokens,
            requests: msgCount,
            cost,
          });
        }
      }

      const limits: UsageLimit[] = [
        { label: "Sessions", used: sessions, limit: null, unit: "sessions" },
        { label: "Messages", used: messages, limit: null, unit: "messages" },
        { label: "Days tracked", used: days, limit: null, unit: "days" }
      ];

      return {
        id: cfg.id,
        name: cfg.name,
        ok: true,
        currency: "USD",
        totalCost,
        totalInputTokens,
        totalOutputTokens,
        byModel,
        note: "Zen Models: 100% Free & Unlimited",
        limits,
      };
    } catch (e) {
      return errorUsage(cfg, e);
    }
  },
};

function parseNumber(str: string): number {
  if (!str) return 0;
  str = str.replace(/,/g, "");
  if (str.endsWith("M")) return parseFloat(str.slice(0, -1)) * 1000000;
  if (str.endsWith("K")) return parseFloat(str.slice(0, -1)) * 1000;
  return parseFloat(str);
}
