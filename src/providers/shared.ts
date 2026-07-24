import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface LocalModelUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  cost: number;
}

export async function getLocalModelUsages(prefix: string): Promise<LocalModelUsage[]> {
  try {
    const { stdout } = await execAsync("/opt/homebrew/bin/opencode stats --models");
    const byModel: LocalModelUsage[] = [];
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

        const lowerName = modelName.toLowerCase();
        if (!lowerName.startsWith(prefix.toLowerCase())) continue;

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

        byModel.push({
          model: modelName,
          inputTokens,
          outputTokens,
          requests: msgCount,
          cost,
        });
      }
    }
    return byModel;
  } catch (_) {
    return [];
  }
}

function parseNumber(str: string): number {
  if (!str) return 0;
  str = str.replace(/,/g, "");
  if (str.endsWith("M")) return parseFloat(str.slice(0, -1)) * 1000000;
  if (str.endsWith("K")) return parseFloat(str.slice(0, -1)) * 1000;
  return parseFloat(str);
}
