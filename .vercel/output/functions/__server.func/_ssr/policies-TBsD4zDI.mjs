import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Page } from "./page-BnHMlR9K.mjs";
import { t as Badge } from "./badge-EHUdXv-4.mjs";
import { n as Switch, o as cn, u as useWallStore } from "./router-zWo_lJGY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/policies-TBsD4zDI.js
var import_jsx_runtime = require_jsx_runtime();
var GROUPS = [
	"filesystem",
	"git",
	"sql",
	"network",
	"shell",
	"secrets",
	"mcp"
];
function PoliciesPage() {
	const policies = useWallStore((s) => s.policies);
	const toggle = useWallStore((s) => s.togglePolicy);
	const setAction = useWallStore((s) => s.setPolicyAction);
	const armed = policies.filter((p) => p.enabled).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl sm:text-4xl font-semibold tracking-tight",
			children: "Policies"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted max-w-xl",
			children: "Structural rules evaluated on every tool call. Disable a rule to temporarily widen the blast radius."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "font-mono text-sm text-subtle tabular-nums",
			children: [
				armed,
				" / ",
				policies.length,
				" armed"
			]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-8 space-y-8",
		children: GROUPS.map((g) => {
			const items = policies.filter((p) => p.group === g);
			if (!items.length) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs uppercase tracking-wider text-subtle mb-3",
				children: g
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel divide-y divide-border",
				children: items.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-sm font-medium",
									children: p.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: p.severity === "critical" || p.severity === "high" ? "block" : "neutral",
									children: p.severity
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: p.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 flex gap-1",
								children: [
									"block",
									"warn",
									"redact"
								].map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setAction(p.id, a),
									className: cn("h-8 px-3 rounded-full text-xs capitalize", p.action === a ? "bg-elevated text-fg shadow-border" : "text-subtle hover:text-fg"),
									children: a
								}, a))
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: p.enabled,
						onCheckedChange: () => toggle(p.id),
						"aria-label": `Toggle ${p.title}`
					})]
				}, p.id))
			})] }, g);
		})
	})] });
}
//#endregion
export { PoliciesPage as component };
