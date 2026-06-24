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
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import type { CSSProperties } from "react";
import { useTheme } from "@/lib/light-dark-providers";
import { cn } from "@/lib/utils";

type Status = "ok" | "running" | "failed" | "idle";
type StepNodeType = Node<{ label: string; status: Status }, "step">;

// Presentation is driven entirely by node.data.status — the whole point of a
// custom node: the library owns layout/edges, you own how a node looks.
const statusBorder: Record<Status, string> = {
  ok: "border-emerald-500/70",
  running: "border-amber-500/70",
  failed: "border-red-500/70",
  idle: "border-border",
};
const statusDot: Record<Status, string> = {
  ok: "bg-emerald-500",
  running: "bg-amber-500",
  failed: "bg-red-500",
  idle: "bg-muted-foreground/40",
};

function StepNode({ data, selected }: NodeProps<StepNodeType>) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border-2 bg-card px-3 py-2 text-card-foreground text-sm shadow-sm",
        statusBorder[data.status],
        selected && "ring-2 ring-primary"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="size-2! border-0! bg-foreground/30!"
      />
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          statusDot[data.status],
          data.status === "running" && "animate-pulse"
        )}
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

// Defined once, outside the component — a fresh object every render remounts
// every node in the graph.
const nodeTypes: NodeTypes = { step: StepNode };

const initialNodes: StepNodeType[] = [
  {
    id: "ingest",
    type: "step",
    position: { x: 95, y: 0 },
    data: { label: "Ingest", status: "ok" },
  },
  {
    id: "validate",
    type: "step",
    position: { x: 90, y: 80 },
    data: { label: "Validate", status: "ok" },
  },
  {
    id: "transform",
    type: "step",
    position: { x: 0, y: 170 },
    data: { label: "Transform", status: "running" },
  },
  {
    id: "quarantine",
    type: "step",
    position: { x: 205, y: 170 },
    data: { label: "Quarantine", status: "failed" },
  },
  {
    id: "load",
    type: "step",
    position: { x: 15, y: 260 },
    data: { label: "Load", status: "idle" },
  },
  {
    id: "report",
    type: "step",
    position: { x: 15, y: 350 },
    data: { label: "Report", status: "idle" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "ingest", target: "validate" },
  { id: "e2", source: "validate", target: "transform" },
  { id: "e3", source: "validate", target: "quarantine" },
  { id: "e4", source: "transform", target: "load", animated: true },
  { id: "e5", source: "load", target: "report" },
];

function WorkflowGraphInner() {
  const { theme } = useTheme();
  const [nodes, , onNodesChange] = useNodesState<StepNodeType>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState<Edge>(initialEdges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      colorMode={theme}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      // Let the article scroll normally over the canvas; zoom via the controls.
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

/** Live, draggable workflow DAG rendered with a custom React Flow node. */
export function WorkflowGraphDemo() {
  return (
    <div className="my-6 h-[420px] overflow-hidden rounded-xl border">
      <ReactFlowProvider>
        <WorkflowGraphInner />
      </ReactFlowProvider>
    </div>
  );
}
