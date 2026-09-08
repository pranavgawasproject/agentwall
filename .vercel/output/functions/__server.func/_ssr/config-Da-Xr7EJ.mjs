import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Page } from "./page-BnHMlR9K.mjs";
import { t as Button } from "./button-DI9KJhED.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as EGRESS_ALLOWLIST, u as useWallStore } from "./router-zWo_lJGY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/config-Da-Xr7EJ.js
var import_jsx_runtime = require_jsx_runtime();
function ConfigPage() {
	const policies = useWallStore((s) => s.policies);
	const reset = useWallStore((s) => s.resetDemo);
	const toml = toToml(policies);
	function copy() {
		navigator.clipboard.writeText(toml);
		toast.success("agentwall.toml copied");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl sm:text-4xl font-semibold tracking-tight",
			children: "Config"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-2 text-muted max-w-xl",
			children: [
				"Generated from the live policy set. Drop this in the project root, then wrap any agent with",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-fg",
					children: "agentwall -- command"
				}),
				"."
			]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: copy,
				children: "Copy TOML"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => {
					reset();
					toast.message("Demo state reset");
				},
				children: "Reset demo"
			})]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
		className: "mt-8 panel p-4 sm:p-5 font-mono text-xs sm:text-sm text-muted whitespace-pre overflow-x-auto leading-relaxed",
		children: toml
	})] });
}
function toToml(policies) {
	const lines = [
		"# agentwall.toml — generated from the live console",
		"",
		"[proxy]",
		"listen = \"stdio\"",
		"latency_budget_ms = 5",
		"",
		"[secrets]",
		"redact = true",
		"rehydrate_authorized = true",
		"patterns = [\"openai\", \"anthropic\", \"aws\", \"stripe\", \"github\", \"jwt\", \"ssh\", \"db_url\"]",
		"",
		"[egress]",
		"default = \"deny\"",
		`allow = [${EGRESS_ALLOWLIST.map((h) => `"${h}"`).join(", ")}]`,
		"",
		"[audit]",
		"path = \"~/.agentwall/sessions.db\"",
		"",
		"[policies]"
	];
	for (const p of policies) lines.push(`  "${p.id}" = { enabled = ${p.enabled}, action = "${p.action}" }`);
	return lines.join("\n");
}
//#endregion
export { ConfigPage as component };
