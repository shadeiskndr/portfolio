"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  Handle,
  type Node,
  type NodeProps,
  type NodeTypes,
  Position,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { type CSSProperties, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/light-dark-providers";
import { cn } from "@/lib/utils";

type StepNodeType = Node<{ label: string; ghost?: boolean }, "step">;

function StepNode({ data }: NodeProps<StepNodeType>) {
  return (
    <div
      className={cn(
        "rounded-lg border-2 border-border bg-card px-3 py-2 text-card-foreground text-sm shadow-sm transition-opacity",
        data.ghost && "opacity-5"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="size-2! border-0! bg-foreground/30!"
      />
      <span className="font-medium">{data.label}</span>
      <Handle
        type="source"
        position={Position.Bottom}
        className="size-2! border-0! bg-foreground/30!"
      />
    </div>
  );
}

const nodeTypes: NodeTypes = { step: StepNode };

const BASE_NODES: StepNodeType[] = [
  { id: "start", type: "step", position: { x: 90, y: 0 }, data: { label: "Start" } },
  { id: "route", type: "step", position: { x: 90, y: 84 }, data: { label: "Route" } },
  { id: "filter", type: "step", position: { x: 90, y: 168 }, data: { label: "Filter" } },
  { id: "load", type: "step", position: { x: 0, y: 252 }, data: { label: "Load" } },
  { id: "report", type: "step", position: { x: 185, y: 252 }, data: { label: "Report" } },
];

const BASE_EDGES: Edge[] = [
  { id: "e-start-route", source: "start", target: "route" },
  { id: "e-route-filter", source: "route", target: "filter" },
  { id: "e-filter-load", source: "filter", target: "load" },
  { id: "e-filter-report", source: "filter", target: "report" },
];

const HIDDEN = "filter";
const touchesHidden = (e: Edge) => e.source === HIDDEN || e.target === HIDDEN;

function GraphInner({ hide, guard }: { hide: boolean; guard: boolean }) {
  const { theme } = useTheme();

  const nodes = useMemo(
    () => BASE_NODES.map((n) => (n.id === HIDDEN ? { ...n, data: { ...n.data, ghost: hide } } : n)),
    [hide]
  );

  const edges = useMemo(() => {
    if (hide && guard) return BASE_EDGES.filter((e) => !touchesHidden(e));
    if (hide) {
      // The node is gone but its edges remain — arrows into empty space.
      return BASE_EDGES.map((e) =>
        touchesHidden(e)
          ? { ...e, animated: true, label: "orphaned", style: { stroke: "#ef4444" } }
          : e
      );
    }
    return BASE_EDGES;
  }, [hide, guard]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      colorMode={theme}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      nodesDraggable={false}
      nodesConnectable={false}
      zoomOnScroll={false}
      panOnScroll={false}
      preventScrolling={false}
      proOptions={{ hideAttribution: true }}
      className="bg-muted/40"
      style={
        {
          "--xy-background-color": "transparent",
          "--xy-background-pattern-color": "var(--color-muted-foreground)",
        } as CSSProperties
      }
    >
      <Background variant={BackgroundVariant.Dots} gap={18} size={1} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

/** Toggle a node hidden with and without cascading to its edges. */
export function GraphOrphanEdgesDemo() {
  const [hide, setHide] = useState(true);
  const [guard, setGuard] = useState(false);
  const orphans = hide && !guard ? BASE_EDGES.filter(touchesHidden).length : 0;

  return (
    <div className="my-6 rounded-xl border p-3">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button size="sm" variant={hide ? "default" : "outline"} onClick={() => setHide((h) => !h)}>
          {hide ? "Filter node: hidden" : "Filter node: shown"}
        </Button>
        <Button
          size="sm"
          variant={guard ? "default" : "outline"}
          disabled={!hide}
          onClick={() => setGuard((g) => !g)}
        >
          {guard ? "Cascade to edges: on" : "Cascade to edges: off"}
        </Button>
        <span
          className={cn(
            "ml-auto rounded-md px-2 py-1 font-medium text-xs",
            orphans > 0 ? "bg-red-500/15 text-red-600 dark:text-red-400" : "text-muted-foreground"
          )}
        >
          {orphans > 0 ? `${orphans} orphaned edge${orphans === 1 ? "" : "s"}` : "no orphans"}
        </span>
      </div>
      <div className="h-[340px] overflow-hidden rounded-lg border">
        <ReactFlowProvider>
          <GraphInner hide={hide} guard={guard} />
        </ReactFlowProvider>
      </div>
      <p className="mt-2 text-muted-foreground text-xs">
        Hide the node without cascading and its incident edges (red) dangle into empty space. A node
        and its edges are one unit. (The real fix parsed a Graphviz SVG; this shows the principle.)
      </p>
    </div>
  );
}
