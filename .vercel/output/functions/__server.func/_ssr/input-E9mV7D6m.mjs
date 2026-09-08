import "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as cn } from "./router-zWo_lJGY.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-11 w-full rounded-sm bg-elevated px-3 text-sm text-fg shadow-border placeholder:text-subtle transition-[box-shadow] duration-150 ease-out focus-visible:shadow-border-hover disabled:opacity-40", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-24 w-full rounded-sm bg-elevated px-3 py-2.5 font-mono text-sm text-fg shadow-border placeholder:text-subtle transition-[box-shadow] duration-150 ease-out focus-visible:shadow-border-hover disabled:opacity-40", className),
		...props
	});
}
//#endregion
export { Textarea as n, Input as t };
