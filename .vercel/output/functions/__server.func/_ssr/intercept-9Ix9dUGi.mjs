import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as Page } from "./page-BnHMlR9K.mjs";
import { n as Textarea } from "./input-E9mV7D6m.mjs";
import { t as Button } from "./button-DI9KJhED.mjs";
import { t as Badge } from "./badge-EHUdXv-4.mjs";
import { n as verdictColor, t as VerdictBadge } from "./verdict-BqtciioM.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Square, l as ScanSearch, u as Play } from "../_libs/lucide-react.mjs";
import { a as SCENARIOS, c as formatLatency, i as OVERNIGHT_SEQUENCE, o as cn, u as useWallStore } from "./router-zWo_lJGY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/intercept-9Ix9dUGi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NodeView({ node, depth = 0 }) {
	if (node.kind === "empty") return null;
	if (node.kind === "command") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("font-mono text-xs leading-relaxed", depth && "pl-3"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-subtle",
					children: "cmd"
				}),
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-fg",
					children: node.name
				})
			] }),
			node.flags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pl-3 text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: "flags"
					}),
					" ",
					node.flags.join(" ")
				]
			}),
			node.args.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pl-3 text-muted break-all",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-subtle",
						children: "args"
					}),
					" ",
					node.args.join(" ")
				]
			})
		]
	});
	if (node.kind === "pipe") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn(depth && "pl-3"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-xs text-subtle",
			children: "pipe"
		}), node.commands.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NodeView, {
			node: c,
			depth: depth + 1
		}, i))]
	});
	if (node.kind === "list") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn(depth && "pl-3"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "font-mono text-xs text-subtle",
			children: ["list ", node.op]
		}), node.children.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NodeView, {
			node: c,
			depth: depth + 1
		}, i))]
	});
	if (node.kind === "script") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: node.children.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NodeView, {
		node: c,
		depth
	}, i)) });
	if (node.kind === "subshell" || node.kind === "subst") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn(depth && "pl-3"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-xs text-subtle",
			children: node.kind
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NodeView, {
			node: node.body,
			depth: depth + 1
		})]
	});
	return null;
}
function AstTree({ node }) {
	if (!node) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "No shell AST for this call."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NodeView, { node });
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var inspectWithGrok = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("cfa1b429bc92c9ed5bb56764d2a2712651f5e9f49c61123ed50841a65b425b40"));
var TOOLS = [
	"bash",
	"postgres",
	"write_file"
];
function InterceptPlayground({ initialId }) {
	const runScenario = useWallStore((s) => s.runScenario);
	const runCustom = useWallStore((s) => s.runCustom);
	const lastResult = useWallStore((s) => s.lastResult);
	const takeSnapshot = useWallStore((s) => s.takeSnapshot);
	const sequenceRunning = useWallStore((s) => s.sequenceRunning);
	const setSequenceRunning = useWallStore((s) => s.setSequenceRunning);
	const [selected, setSelected] = (0, import_react.useState)(initialId ?? "rm-rf");
	const [tool, setTool] = (0, import_react.useState)("bash");
	const [command, setCommand] = (0, import_react.useState)(SCENARIOS.find((s) => s.id === (initialId ?? "rm-rf"))?.command ?? "rm -rf / --no-preserve-root");
	const [phase, setPhase] = (0, import_react.useState)("idle");
	const [grok, setGrok] = (0, import_react.useState)(null);
	const [grokBusy, setGrokBusy] = (0, import_react.useState)(false);
	const [grokError, setGrokError] = (0, import_react.useState)(null);
	const scenario = SCENARIOS.find((s) => s.id === selected);
	function pick(id) {
		const s = SCENARIOS.find((x) => x.id === id);
		if (!s) return;
		setSelected(id);
		setCommand(s.command);
		setTool(s.tool || "bash");
		setGrok(null);
		setGrokError(null);
	}
	async function run() {
		setGrok(null);
		setPhase("send");
		await wait(220);
		setPhase("inspect");
		await wait(380);
		if (scenario && command.trim() === scenario.command) runScenario(scenario.id);
		else runCustom(tool, command);
		setPhase("done");
	}
	async function overnight() {
		if (sequenceRunning) {
			setSequenceRunning(false);
			return;
		}
		takeSnapshot("pre-overnight-run");
		setSequenceRunning(true);
		toast("Snapshot taken. Overnight run armed.");
		for (const id of OVERNIGHT_SEQUENCE) {
			if (!useWallStore.getState().sequenceRunning) break;
			pick(id);
			setPhase("send");
			await wait(180);
			setPhase("inspect");
			await wait(320);
			const result = runScenario(id);
			setPhase("done");
			if (result?.verdict === "block") toast.error(`Blocked · ${result.findings[0]?.title ?? result.command}`);
			else if (result?.verdict === "redact") toast.message(`Redacted ${result.secrets.length} secret${result.secrets.length === 1 ? "" : "s"}`);
			await wait(700);
		}
		setSequenceRunning(false);
		toast.success("Overnight run complete. Secrets leaked to the model: 0.");
	}
	async function askGrok() {
		setGrokBusy(true);
		setGrokError(null);
		try {
			const res = await inspectWithGrok({ data: { command } });
			if (!res.ok) setGrokError(res.error);
			else setGrok(res.inspection);
		} catch {
			setGrokError("Could not reach the inspector.");
		} finally {
			setGrokBusy(false);
		}
	}
	const result = lastResult;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl sm:text-4xl font-semibold tracking-tight leading-tight",
					children: "Live interceptor"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted max-w-xl text-pretty",
					children: "Drop a tool call through the wall. AST inspection, DLP, and egress rules decide before anything reaches a sink."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: sequenceRunning ? "outline" : "default",
					onClick: overnight,
					className: "shrink-0",
					children: sequenceRunning ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4" }), " Stop run"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), " Overnight run"] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: SCENARIOS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => pick(s.id),
					className: cn("shrink-0 h-9 px-3 rounded-full text-sm transition-[background-color,color,box-shadow] duration-150 ease-out", selected === s.id ? "bg-accent text-accent-fg" : "text-muted shadow-border hover:text-fg hover:shadow-border-hover"),
					children: s.title
				}, s.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-4 sm:p-5 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-medium",
								children: "Call"
							}), scenario && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-subtle",
								children: scenario.blurb
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2",
							children: TOOLS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setTool(t),
								className: cn("h-9 px-3 rounded-sm text-sm font-mono", tool === t ? "bg-elevated text-fg shadow-border" : "text-muted hover:text-fg"),
								children: t
							}, t))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: command,
							onChange: (e) => setCommand(e.target.value),
							rows: 5,
							spellCheck: false,
							"aria-label": "Tool command"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: run,
								disabled: !command.trim() || sequenceRunning,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), " Run through wall"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: askGrok,
								disabled: grokBusy || !command.trim(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanSearch, { className: "size-4" }), grokBusy ? "Inspecting…" : "Inspect with Grok"]
							})]
						}),
						grokError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-block",
							children: grokError
						}),
						grok && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GrokPanel, { inspection: grok })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pipeline, {
					phase,
					result
				})]
			}),
			result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultDetail, { result })
		]
	});
}
function GrokPanel({ inspection }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel-inset p-3 space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-subtle uppercase tracking-wider",
					children: "Grok analysis"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: inspection.recommendation === "block" ? "block" : inspection.recommendation === "redact" ? "redact" : "allow",
					children: inspection.recommendation
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-fg",
				children: inspection.intent
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					"Risk ",
					inspection.risk,
					inspection.obfuscated ? " · obfuscated" : ""
				]
			}),
			inspection.findings.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-medium",
					children: f.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-muted",
					children: f.detail
				})]
			}, i))
		]
	});
}
function Pipeline({ phase, result }) {
	const verdict = phase === "done" ? result?.verdict ?? null : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel p-4 sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-medium mb-4",
				children: "JSON-RPC path"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2 sm:gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hop, {
						title: "Client",
						sub: "Cursor / Claude",
						active: phase !== "idle"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hop, {
						title: "AgentWall",
						sub: phase === "inspect" ? "AST + DLP" : "proxy",
						active: phase === "inspect" || phase === "done",
						emphasis: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hop, {
						title: verdict === "block" ? "Blocked" : "Sink",
						sub: verdict === "block" ? "synthetic error" : "bash / MCP / db",
						active: phase === "done" && verdict !== "block"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative h-1 mt-4 mb-5 rounded-full bg-elevated overflow-hidden",
				children: [(phase === "send" || phase === "inspect") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-y-0 w-1/3 bg-fg/70 aw-flow" }), phase === "done" && verdict && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("absolute inset-y-0 w-full", verdict === "block" ? "bg-block/70" : verdict === "redact" ? "bg-redact/70" : "bg-allow/70") })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 max-h-64 overflow-auto pr-1",
				children: [(result?.frames ?? []).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel-inset p-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2 mb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-xs text-subtle",
							children: [
								f.dir === "in" ? "→" : f.dir === "out" ? "←" : "◆",
								" ",
								f.label
							]
						}), f.tone && f.tone !== "info" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictBadge, { verdict: f.tone })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "font-mono text-xs text-muted whitespace-pre-wrap break-all leading-relaxed",
						children: f.body
					})]
				}, f.id)), !result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Run a call to see framed JSON-RPC traffic."
				})]
			})
		]
	});
}
function Hop({ title, sub, active, emphasis }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-md p-3 min-h-20", emphasis ? "bg-elevated shadow-border" : "bg-bg shadow-border", active && "shadow-border-hover"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm font-medium",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-subtle mt-1",
			children: sub
		})]
	});
}
function ResultDetail({ result }) {
	const secrets = result.secrets;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-4 sm:p-5 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium",
							children: "Verdict"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictBadge, { verdict: result.verdict })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("text-3xl font-semibold tabular-nums tracking-tight", verdictColor(result.verdict)),
						children: formatLatency(result.latencyMs)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Inspection overhead. Budget is 5ms."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [result.findings.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "No policy findings."
						}), result.findings.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel-inset p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: f.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-subtle",
									children: f.rule
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted mt-1",
								children: f.detail
							})]
						}, f.id))]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-4 sm:p-5 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "AST"
					}),
					result.sqlAst && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-mono text-xs text-ice mb-2",
						children: ["SQL ", result.sqlAst]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AstTree, { node: result.ast })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-4 sm:p-5 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Secrets"
					}),
					secrets.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "No credentials in this payload."
					}),
					secrets.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel-inset p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-medium",
								children: s.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-xs text-redact mt-1 break-all",
								children: s.token
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-xs text-subtle mt-1 break-all",
								children: s.value.length > 28 ? `${s.value.slice(0, 14)}…${s.value.slice(-8)}` : s.value
							})
						]
					}, s.token)),
					result.verdict === "redact" && result.redactedOutput && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "font-mono text-xs text-muted whitespace-pre-wrap break-all panel-inset p-3 max-h-40 overflow-auto",
						children: result.redactedOutput
					})
				]
			})
		]
	});
}
function wait(ms) {
	return new Promise((r) => setTimeout(r, ms));
}
function InterceptPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Page, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InterceptPlayground, {}) });
}
//#endregion
export { InterceptPage as component };
