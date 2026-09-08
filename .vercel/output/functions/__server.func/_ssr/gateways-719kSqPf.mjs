import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Page } from "./page-BnHMlR9K.mjs";
import { t as Button } from "./button-DI9KJhED.mjs";
import { t as Badge } from "./badge-EHUdXv-4.mjs";
import { r as EGRESS_ALLOWLIST, s as formatClock, u as useWallStore } from "./router-zWo_lJGY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gateways-719kSqPf.js
var import_jsx_runtime = require_jsx_runtime();
function GatewaysPage() {
	const gateways = useWallStore((s) => s.gateways);
	const setStatus = useWallStore((s) => s.setGatewayStatus);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl sm:text-4xl font-semibold tracking-tight",
			children: "Gateways"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted max-w-xl",
			children: "Every MCP server and shell is a high-privilege sink. AgentWall fronts them, allowlists egress, and can drop a third-party server entirely."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 grid gap-3",
			children: gateways.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-mono text-sm font-medium",
									children: g.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: g.status === "proxied" ? "allow" : g.status === "blocked" ? "block" : "neutral",
									children: g.status
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "ice",
									children: g.transport
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted",
							children: [
								g.kind,
								" · ",
								g.tools,
								" tools · egress ",
								g.egress
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-xs text-subtle",
							children: ["last ", formatClock(g.lastCall)]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [g.status !== "proxied" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setStatus(g.id, "proxied"),
						children: "Proxy"
					}), g.status !== "blocked" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setStatus(g.id, "blocked"),
						children: "Block"
					})]
				})]
			}, g.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 panel p-4 sm:p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Egress allowlist"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "curl, wget, and MCP fetches to any other host are blocked. Third-party MCP servers cannot exfiltrate the tree."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: EGRESS_ALLOWLIST.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-xs px-3 h-8 inline-flex items-center rounded-full bg-elevated text-ice",
						children: h
					}, h))
				})
			]
		})
	] });
}
//#endregion
export { GatewaysPage as component };
