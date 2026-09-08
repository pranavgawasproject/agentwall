import { createServerFn } from "@tanstack/react-start";

export type GrokInspection = {
  intent: string;
  risk: "critical" | "high" | "medium" | "low" | "none";
  obfuscated: boolean;
  findings: { title: string; detail: string }[];
  recommendation: "block" | "allow" | "redact";
};

export const inspectWithGrok = createServerFn({ method: "POST" })
  .validator((input: { command: string }) => input)
  .handler(async ({ data }): Promise<{ ok: true; inspection: GrokInspection } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "AI inspection is unavailable in this environment." };

    const command = data.command.slice(0, 2000);
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0,
        max_tokens: 600,
        messages: [
          {
            role: "system",
            content:
              "You are the policy analyst inside AgentWall, a zero-trust proxy for AI agent tool calls. Inspect a shell or SQL command. Reply with ONLY compact JSON: {\"intent\":\"...\",\"risk\":\"critical|high|medium|low|none\",\"obfuscated\":boolean,\"findings\":[{\"title\":\"...\",\"detail\":\"...\"}],\"recommendation\":\"block|allow|redact\"}. No markdown.",
          },
          { role: "user", content: command },
        ],
      }),
    });

    if (!res.ok) return { ok: false, error: `xAI API error ${res.status}` };

    const body = (await res.json()) as { choices: { message: { content: string } }[] };
    const text = body.choices[0]?.message.content ?? "";
    const jsonSlice = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    try {
      const parsed = JSON.parse(jsonSlice) as GrokInspection;
      if (!parsed.intent || !parsed.risk) throw new Error("shape");
      return { ok: true, inspection: parsed };
    } catch {
      return { ok: false, error: "Could not parse model response." };
    }
  });
