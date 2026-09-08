import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analyze-CnMm6ylZ.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var inspectWithGrok_createServerFn_handler = createServerRpc({
	id: "cfa1b429bc92c9ed5bb56764d2a2712651f5e9f49c61123ed50841a65b425b40",
	name: "inspectWithGrok",
	filename: "src/lib/analyze.ts"
}, (opts) => inspectWithGrok.__executeServer(opts));
var inspectWithGrok = createServerFn({ method: "POST" }).validator((input) => input).handler(inspectWithGrok_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI inspection is unavailable in this environment."
	};
	const command = data.command.slice(0, 2e3);
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			temperature: 0,
			max_tokens: 600,
			messages: [{
				role: "system",
				content: "You are the policy analyst inside AgentWall, a zero-trust proxy for AI agent tool calls. Inspect a shell or SQL command. Reply with ONLY compact JSON: {\"intent\":\"...\",\"risk\":\"critical|high|medium|low|none\",\"obfuscated\":boolean,\"findings\":[{\"title\":\"...\",\"detail\":\"...\"}],\"recommendation\":\"block|allow|redact\"}. No markdown."
			}, {
				role: "user",
				content: command
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `xAI API error ${res.status}`
	};
	const jsonSlice = ((await res.json()).choices[0]?.message.content ?? "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
	try {
		const parsed = JSON.parse(jsonSlice);
		if (!parsed.intent || !parsed.risk) throw new Error("shape");
		return {
			ok: true,
			inspection: parsed
		};
	} catch {
		return {
			ok: false,
			error: "Could not parse model response."
		};
	}
});
//#endregion
export { inspectWithGrok_createServerFn_handler };
