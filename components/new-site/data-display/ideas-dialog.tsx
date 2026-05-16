"use client";

import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  Handle,
  type Node,
  type NodeProps,
  type NodeTypes,
  type OnConnect,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { type CSSProperties, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { useTheme } from "@/lib/light-dark-providers";
import { IDEA_CONNECTIONS, IDEAS, type IdeaColor } from "@/lib/new-site/data";
import { cn } from "@/lib/utils";

type PostItData = {
  title: string;
  body?: string;
  author?: string;
  color?: IdeaColor;
  rotation?: number;
};

type PostItNodeType = Node<PostItData, "postit">;

const colorClasses: Record<IdeaColor, string> = {
  yellow: "bg-yellow-100 text-amber-950",
  pink: "bg-pink-100 text-pink-950",
  blue: "bg-sky-100 text-sky-950",
  green: "bg-lime-100 text-lime-950",
};

function PostItNode({ data, selected }: NodeProps<PostItNodeType>) {
  const color = data.color ?? "yellow";
  const rotation = data.rotation ?? -3;
  return (
    <div
      style={{ transform: `rotate(${rotation}deg)` }}
      className={cn(
        "w-56 p-4 shadow-[3px_4px_12px_rgba(0,0,0,0.35)] transition-transform hover:scale-[1.02]",
        colorClasses[color],
        selected && "ring-2 ring-foreground/40"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="size-2! border-0! bg-foreground/30!"
      />
      <p
        className="font-serif text-lg leading-snug"
        style={{ fontFamily: "var(--font-caveat), ui-serif, Georgia, serif" }}
      >
        {data.title}
      </p>
      {data.body && (
        <p
          className="mt-2 font-serif text-sm leading-relaxed opacity-75"
          style={{ fontFamily: "var(--font-caveat), ui-serif, Georgia, serif" }}
        >
          {data.body}
        </p>
      )}
      {data.author && (
        <p
          className="mt-3 text-right font-serif text-xs opacity-60"
          style={{ fontFamily: "var(--font-caveat), ui-serif, Georgia, serif" }}
        >
          — {data.author}
        </p>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="size-2! border-0! bg-foreground/30!"
      />
    </div>
  );
}

const nodeTypes: NodeTypes = { postit: PostItNode };

const edgeStyle = { stroke: "rgba(0,0,0,0.35)", strokeDasharray: "4 4" } as const;

const initialNodes: PostItNodeType[] = IDEAS.map((idea) => ({
  id: idea.id,
  type: "postit",
  position: idea.position,
  data: {
    title: idea.title,
    body: idea.body,
    author: idea.author,
    color: idea.color,
    rotation: idea.rotation,
  },
}));

const initialEdges: Edge[] = IDEA_CONNECTIONS.map(({ from, to }) => ({
  id: `e${from}-${to}`,
  source: from,
  target: to,
  animated: true,
  style: edgeStyle,
}));

function IdeasCanvas() {
  const { theme } = useTheme();
  const [nodes, , onNodesChange] = useNodesState<PostItNodeType>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) => addEdge({ ...connection, animated: true, style: edgeStyle }, eds)),
    [setEdges]
  );

  const defaultViewport = useMemo(() => ({ x: 0, y: 0, zoom: 1 }), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      defaultViewport={defaultViewport}
      colorMode={theme}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      proOptions={{ hideAttribution: true }}
      className="bg-muted/50"
      style={
        {
          "--xy-background-color": "transparent",
          "--xy-background-pattern-color": "var(--color-muted-foreground)",
        } as CSSProperties
      }
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

interface IdeasDialogProps {
  children?: React.ReactNode;
}

export function IdeasDialog({ children }: IdeasDialogProps) {
  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm">
            Ideas
          </Button>
        )}
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="flex h-[80vh] flex-col gap-0 overflow-hidden p-0 md:h-[85vh] md:w-[95vw] md:max-w-4xl!">
        <ResponsiveDialogHeader className="border-foreground/10 border-b px-5 py-3 sm:py-4">
          <ResponsiveDialogTitle className="font-serif text-base">Ideas</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-xs">
            Loose thoughts pinned to a board.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="min-h-0 flex-1">
          <ReactFlowProvider>
            <IdeasCanvas />
          </ReactFlowProvider>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export default IdeasDialog;
