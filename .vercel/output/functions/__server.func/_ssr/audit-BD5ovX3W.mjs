import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Page } from "./page-BnHMlR9K.mjs";
import { t as Input } from "./input-E9mV7D6m.mjs";
import { t as Button } from "./button-DI9KJhED.mjs";
import { t as VerdictBadge } from "./verdict-BqtciioM.mjs";
import { c as formatLatency, o as cn, s as formatClock, u as useWallStore } from "./router-zWo_lJGY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/audit-BD5ovX3W.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FILTERS = [
	"all",
	"block",
	"redact",
	"allow",
	"rehydrate"
];
function AuditPage() {
	const events = useWallStore((s) => s.events);
	const [q, setQ] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [open, setOpen] = (0, import_react.useState)(null);
	const filtered = (0, import_react.useMemo)(() => {
		return events.filter((e) => {
			if (filter !== "all" && e.verdict !== filter) return false;
			if (!q.trim()) return true;
			return `${e.command} ${e.tool} ${e.client} ${e.summary}`.toLowerCase().includes(q.toLowerCase());
		});
	}, [
		events,
		q,
		filter
	]);
	function exportJson() {
		const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "agentwall-audit.json";
		a.click();
		URL.revokeObjectURL(url);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl sm:text-4xl font-semibold tracking-tight",
				children: "Audit log"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted max-w-xl",
				children: "Append-only intercepts for this session. Every RPC, decision, and token swap."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: exportJson,
				children: "Export JSON"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 flex flex-col gap-3 sm:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Search command, tool, client…",
				"aria-label": "Search audit"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 overflow-x-auto",
				children: FILTERS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFilter(f),
					className: cn("h-11 px-3 rounded-sm text-sm capitalize shrink-0", filter === f ? "bg-elevated text-fg shadow-border" : "text-muted hover:text-fg"),
					children: f
				}, f))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 panel divide-y divide-border",
			children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "p-6 text-sm text-muted",
				children: "No events match that filter."
			}), filtered.map((e) => {
				const expanded = open === e.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "w-full text-left px-4 sm:px-5 py-3 grid grid-cols-[auto_1fr_auto] gap-3 items-center",
					onClick: () => setOpen(expanded ? null : e.id),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictBadge, { verdict: e.verdict }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-sm truncate",
								children: e.command
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-subtle",
								children: [
									formatClock(e.at),
									" · ",
									e.client,
									" · ",
									e.tool
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-subtle tabular-nums",
							children: formatLatency(e.latencyMs)
						})
					]
				}), expanded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-4 sm:px-5 pb-4 space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: e.summary
						}),
						e.findings.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-inset p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm font-medium",
									children: f.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-sm text-muted mt-1",
									children: f.detail
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-mono text-xs text-subtle mt-1",
									children: f.rule
								})
							]
						}, f.id)),
						e.secrets > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-redact",
							children: [e.secrets, " secret(s) translated"]
						})
					]
				})] }, e.id);
			})]
		})
	] });
}
//#endregion
export { AuditPage as component };
