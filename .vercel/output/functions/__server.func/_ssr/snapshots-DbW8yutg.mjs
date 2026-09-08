import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Page } from "./page-BnHMlR9K.mjs";
import { t as Button } from "./button-DI9KJhED.mjs";
import { t as Badge } from "./badge-EHUdXv-4.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { s as formatClock, u as useWallStore } from "./router-zWo_lJGY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/snapshots-DbW8yutg.js
var import_jsx_runtime = require_jsx_runtime();
function SnapshotsPage() {
	const snapshots = useWallStore((s) => s.snapshots);
	const take = useWallStore((s) => s.takeSnapshot);
	const restore = useWallStore((s) => s.restoreSnapshot);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Page, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl sm:text-4xl font-semibold tracking-tight",
			children: "Snapshots"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-muted max-w-xl",
			children: "Copy-on-write of the repository and database before an agent starts a task. One click rolls a rogue run back."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => {
				const s = take();
				toast.success(`Snapshot ${s.name} captured`);
			},
			children: "Take snapshot"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-8 grid gap-3",
		children: snapshots.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-medium",
							children: s.name
						}), s.restored && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "allow",
							children: "restored"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: s.note
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-subtle",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatClock(s.at) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular-nums",
								children: [s.files, " files"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s.bytes }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular-nums",
								children: [s.dbTables, " tables"]
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: () => {
					restore(s.id);
					toast.message(`Rolled back to ${s.name}`);
				},
				children: "Restore"
			})]
		}, s.id))
	})] });
}
//#endregion
export { SnapshotsPage as component };
