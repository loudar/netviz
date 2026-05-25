import { useCallback, useEffect, useRef, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import { useFlowStore, type LabeledEdge as LabeledEdgeType } from "@/store/flow-store";
import { cn } from "@/lib/utils";

export function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
  markerStart,
  markerEnd,
}: EdgeProps<LabeledEdgeType>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });
  const updateEdgeLabel = useFlowStore((s) => s.updateEdgeLabel);
  const [editing, setEditing] = useState(false);
  const label = data?.label ?? "";
  const [draft, setDraft] = useState(label);
  const ref = useRef<HTMLInputElement>(null);

  const selectEdge = useCallback(() => {
    const store = useFlowStore.getState();
    store.onEdgesChange([
      ...store.edges.filter((e) => e.selected).map((e) => ({ type: "select" as const, id: e.id, selected: false })),
      { type: "select", id, selected: true },
    ]);
    store.onNodesChange(
      store.nodes.filter((n) => n.selected).map((n) => ({ type: "select" as const, id: n.id, selected: false }))
    );
  }, [id]);

  useEffect(() => {
    setDraft(label);
  }, [label]);
  useEffect(() => {
    if (editing) {
      ref.current?.focus();
      ref.current?.select();
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next !== label) updateEdgeLabel(id, next);
  };

  const lineStyle = data?.lineStyle ?? "solid";
  const gap = data?.dashGap ?? 6;
  const dashOffset =
    lineStyle === "dashed"
      ? gap * 2
      : lineStyle === "dotted"
      ? 1 + Math.max(2, gap)
      : 12;
  const edgeStyle: React.CSSProperties = {
    ...(data?.color && !data?.turbo ? { stroke: data.color } : {}),
    ...(lineStyle === "dashed"
      ? { strokeDasharray: `${gap} ${gap}` }
      : lineStyle === "dotted"
      ? {
          strokeDasharray: `1 ${Math.max(2, gap)}`,
          strokeLinecap: "round" as const,
        }
      : {}),
    ["--dash-offset" as string]: dashOffset,
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={edgeStyle} markerStart={markerStart} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          className="nodrag nopan pointer-events-auto absolute"
        >
          {editing ? (
            <input
              ref={ref}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") {
                  setDraft(label);
                  setEditing(false);
                }
                e.stopPropagation();
              }}
              className="h-6 w-28 rounded-full border border-border bg-card px-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring"
              placeholder="Label"
            />
          ) : (
            <button
              type="button"
              onClick={selectEdge}
              onDoubleClick={() => setEditing(true)}
              style={{
                ...(data?.labelTextColor ? { color: data.labelTextColor } : {}),
                ...(data?.labelBgColor
                  ? { backgroundColor: data.labelBgColor }
                  : {}),
                ...(data?.labelBorderColor
                  ? { borderColor: data.labelBorderColor }
                  : {}),
              }}
              className={cn(
                "h-6 rounded-full border px-2.5 text-xs font-medium transition-all",
                !data?.labelBgColor && "bg-card",
                !data?.labelBorderColor && "border-border",
                !data?.labelTextColor &&
                  "text-muted-foreground hover:text-foreground",
                selected && !data?.labelBorderColor && "border-ring",
                selected && !data?.labelTextColor && "text-foreground",
                !label && "opacity-0 hover:opacity-100",
                selected && !label && "opacity-100"
              )}
            >
              {label || "+ label"}
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
