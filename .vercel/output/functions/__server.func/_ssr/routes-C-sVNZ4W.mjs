import { x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Page } from "./page-BnHMlR9K.mjs";
import { t as Button } from "./button-DI9KJhED.mjs";
import { t as VerdictBadge } from "./verdict-BqtciioM.mjs";
import { h as ArrowRight, o as ShieldCheck, u as Play } from "../_libs/lucide-react.mjs";
import { c as formatLatency, l as statsFrom, s as formatClock, u as useWallStore } from "./router-zWo_lJGY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C-sVNZ4W.js
var import_jsx_runtime = require_jsx_runtime();
function Overview() {
	const events = useWallStore((s) => s.events);
	const gateways = useWallStore((s) => s.gateways);
	const vault = useWallStore((s) => s.vault);
	const daemonArmed = useWallStore((s) => s.daemonArmed);
	const stats = statsFrom(events);
	const proxied = gateways.filter((g) => g.status === "proxied").length;
	const chart = buildChart(events);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "aw-rise flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-sm text-muted mb-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: daemonArmed ? "text-allow" : "text-subtle",
							children: daemonArmed ? "Armed" : "Paused"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-subtle",
							children: "/"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [proxied, " sinks proxied"] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05]",
					children: [
						"Blast radius,",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"contained."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-muted max-w-lg text-pretty",
					children: "AgentWall sits between Cursor, Claude Code, and every MCP or shell sink. Secrets never enter the model. Destructive AST matches never reach the kernel."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/intercept",
						children: ["Open interceptor", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/intercept",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), " Overnight demo"]
					})
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Allowed",
					value: stats.allowed,
					hint: "forwarded to sink"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Blocked",
					value: stats.blocked,
					hint: "synthetic error",
					tone: "block"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Redacted",
					value: stats.redacted,
					hint: "nonces in context",
					tone: "redact"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Leaked",
					value: stats.leaked,
					hint: "secrets to the model",
					tone: "allow"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Inspection latency"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-xs text-subtle tabular-nums",
						children: [
							"avg ",
							formatLatency(stats.avg),
							" · budget 5ms"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, { values: chart.map((d) => d.ms) })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-4 sm:p-5 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Coverage"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "Outbound DLP",
						value: `${vault.length} live nonces`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "MCP gateways",
						value: `${proxied} / ${gateways.length} proxied`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: "CoW snapshots",
						value: "on before unsupervised runs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-2 text-sm text-muted pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
							className: "size-4 mt-0.5 text-allow shrink-0",
							strokeWidth: 1.75
						}), "Zero secrets have crossed into model context this session."]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Architecture, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 panel overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 sm:px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Recent intercepts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/audit",
					className: "text-sm text-ice hover:text-fg",
					children: "Full audit"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border",
				children: events.slice(0, 8).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[auto_1fr_auto] sm:grid-cols-[7rem_6rem_1fr_auto] gap-3 items-center px-4 sm:px-5 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:block font-mono text-xs text-subtle tabular-nums",
							children: formatClock(e.at)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictBadge, { verdict: e.verdict }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-sm truncate",
								children: e.command
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-subtle truncate",
								children: [
									e.client,
									" · ",
									e.tool,
									" · ",
									e.summary
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-subtle tabular-nums",
							children: formatLatency(e.latencyMs)
						})
					]
				}, e.id))
			})]
		})
	] });
}
function Stat({ label, value, hint, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-subtle uppercase tracking-wider",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `mt-2 text-3xl font-semibold tabular-nums tracking-tight ${tone === "block" ? "text-block" : tone === "redact" ? "text-redact" : "text-fg"}`,
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-xs text-muted",
				children: hint
			})
		]
	});
}
function Row({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-right text-fg",
			children: value
		})]
	});
}
function Architecture() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
		children: [
			{
				title: "Transport",
				copy: "Dual-faced JSON-RPC. Surfaces as an MCP server to the client, owns the real sink as a child."
			},
			{
				title: "AST engine",
				copy: "tree-sitter-grade shell + SQL inspection. Obfuscated pipes, force-pushes, unbounded DML."
			},
			{
				title: "Secret vault",
				copy: "Pattern + entropy DLP. Ephemeral nonces inbound; rehydration only at authorized sinks."
			},
			{
				title: "Audit",
				copy: "Append-only local log. Every frame, decision, and token translation stays on disk."
			}
		].map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-4 sm:p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-mono text-xs text-subtle tabular-nums",
					children: ["0", i + 1]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-2 text-base font-medium",
					children: l.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: l.copy
				})
			]
		}, l.title))
	});
}
function Sparkline({ values }) {
	const w = 640;
	const h = 160;
	const pad = 10;
	const min = Math.min(...values, .2) - .35;
	const max = Math.max(...values, 1) + .45;
	const span = Math.max(max - min, .5);
	const line = values.map((v, i) => {
		return {
			x: pad + (values.length === 1 ? 0 : i / (values.length - 1) * 620),
			y: pad + (1 - (v - min) / span) * 140
		};
	}).map((p) => `${p.x},${p.y}`).join(" ");
	const area = `${pad},150 ${line} 630,150`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		className: "h-full w-full text-fg",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
			points: area,
			fill: "currentColor",
			opacity: .12
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			points: line,
			fill: "none",
			stroke: "currentColor",
			strokeWidth: 2.5,
			strokeLinejoin: "round"
		})]
	});
}
function buildChart(events) {
	const slice = [...events].slice(0, 14).reverse();
	if (slice.length < 3) return [
		.6,
		1.1,
		.8,
		1.4,
		.9,
		2.1,
		1
	].map((ms, i) => ({
		t: String(i),
		ms
	}));
	return slice.map((e, i) => ({
		t: String(i),
		ms: e.latencyMs
	}));
}
//#endregion
export { Overview as component };
