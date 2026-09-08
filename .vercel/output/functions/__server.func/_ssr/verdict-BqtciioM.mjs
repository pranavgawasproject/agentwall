import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-EHUdXv-4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/verdict-BqtciioM.js
var import_jsx_runtime = require_jsx_runtime();
var TONE = {
	allow: "allow",
	block: "block",
	redact: "redact",
	rehydrate: "ice"
};
var LABEL = {
	allow: "Allow",
	block: "Block",
	redact: "Redact",
	rehydrate: "Rehydrate"
};
function VerdictBadge({ verdict }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: TONE[verdict],
		children: LABEL[verdict]
	});
}
function verdictColor(v) {
	if (v === "block") return "text-block";
	if (v === "redact") return "text-redact";
	if (v === "rehydrate") return "text-ice";
	return "text-allow";
}
//#endregion
export { verdictColor as n, VerdictBadge as t };
