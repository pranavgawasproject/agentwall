import type { AstNode } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

function NodeView({ node, depth = 0 }: { node: AstNode; depth?: number }) {
  if (node.kind === "empty") return null;
  if (node.kind === "command") {
    return (
      <div className={cn("font-mono text-xs leading-relaxed", depth && "pl-3")}>
        <div>
          <span className="text-subtle">cmd</span>{" "}
          <span className="text-fg">{node.name}</span>
        </div>
        {node.flags.length > 0 && (
          <div className="pl-3 text-muted">
            <span className="text-subtle">flags</span> {node.flags.join(" ")}
          </div>
        )}
        {node.args.length > 0 && (
          <div className="pl-3 text-muted break-all">
            <span className="text-subtle">args</span> {node.args.join(" ")}
          </div>
        )}
      </div>
    );
  }
  if (node.kind === "pipe") {
    return (
      <div className={cn(depth && "pl-3")}>
        <div className="font-mono text-xs text-subtle">pipe</div>
        {node.commands.map((c, i) => (
          <NodeView key={i} node={c} depth={depth + 1} />
        ))}
      </div>
    );
  }
  if (node.kind === "list") {
    return (
      <div className={cn(depth && "pl-3")}>
        <div className="font-mono text-xs text-subtle">list {node.op}</div>
        {node.children.map((c, i) => (
          <NodeView key={i} node={c} depth={depth + 1} />
        ))}
      </div>
    );
  }
  if (node.kind === "script") {
    return (
      <div>
        {node.children.map((c, i) => (
          <NodeView key={i} node={c} depth={depth} />
        ))}
      </div>
    );
  }
  if (node.kind === "subshell" || node.kind === "subst") {
    return (
      <div className={cn(depth && "pl-3")}>
        <div className="font-mono text-xs text-subtle">{node.kind}</div>
        <NodeView node={node.body} depth={depth + 1} />
      </div>
    );
  }
  return null;
}

export function AstTree({ node }: { node: AstNode | null }) {
  if (!node) {
    return <p className="text-sm text-muted">No shell AST for this call.</p>;
  }
  return <NodeView node={node} />;
}
