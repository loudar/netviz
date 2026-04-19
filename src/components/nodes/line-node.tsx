import { memo, useMemo } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import type { ArrowShape, LineNode } from "@/store/flow-store";

type Pt = { x: number; y: number };

function endpoints(direction: string, w: number, h: number): [Pt, Pt] {
  switch (direction) {
    case "tl-br":
      return [{ x: 0, y: 0 }, { x: w, y: h }];
    case "tr-bl":
      return [{ x: w, y: 0 }, { x: 0, y: h }];
    case "t-b":
      return [{ x: w / 2, y: 0 }, { x: w / 2, y: h }];
    case "l-r":
    default:
      return [{ x: 0, y: h / 2 }, { x: w, y: h / 2 }];
  }
}

function ArrowMarker({
  id,
  shape,
  color,
  end,
}: {
  id: string;
  shape: ArrowShape;
  color: string;
  end: "start" | "end";
}) {
  if (shape === "none") return null;
  const refX = end === "end" ? 8 : 2;
  const refY = 5;
  const common = {
    id,
    viewBox: "0 0 10 10",
    refX,
    refY,
    markerWidth: 8,
    markerHeight: 8,
    orient: "auto-start-reverse" as const,
  };
  switch (shape) {
    case "triangle":
      return (
        <marker {...common}>
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      );
    case "open":
      return (
        <marker {...common}>
          <path
            d="M 0 0 L 10 5 L 0 10"
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      );
    case "diamond":
      return (
        <marker {...common}>
          <path d="M 0 5 L 5 0 L 10 5 L 5 10 z" fill={color} />
        </marker>
      );
    case "circle":
      return (
        <marker {...common}>
          <circle cx="5" cy="5" r="3.5" fill={color} />
        </marker>
      );
    case "bar":
      return (
        <marker {...common}>
          <path d="M 5 0 L 5 10" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </marker>
      );
  }
}

function LineNodeComponent({
  data,
  width,
  height,
  selected,
  id,
}: NodeProps<LineNode>) {
  const w = width ?? 200;
  const h = height ?? 60;
  const direction = data.direction ?? "l-r";
  const curvature = data.curvature ?? 0;
  const rotation = data.rotation ?? 0;
  const stroke = data.strokeColor ?? "#94a3b8";
  const strokeWidth = data.strokeWidth ?? 2;
  const dashed = !!data.dashed;
  const arrowStart = !!data.arrowStart;
  const arrowEnd = !!data.arrowEnd;
  const arrowStartShape: ArrowShape = data.arrowStartShape ?? "triangle";
  const arrowEndShape: ArrowShape = data.arrowEndShape ?? "triangle";

  const [a, b] = useMemo(() => endpoints(direction, w, h), [direction, w, h]);

  const path = useMemo(() => {
    if (!curvature) return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const offset = curvature * (len / 2);
    const cx = mx + nx * offset;
    const cy = my + ny * offset;
    return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
  }, [a, b, curvature]);

  const markerEndId = `line-arrow-end-${id}`;
  const markerStartId = `line-arrow-start-${id}`;

  return (
    <div className="relative h-full w-full select-none">
      <NodeResizer
        isVisible={selected}
        minWidth={40}
        minHeight={20}
        lineClassName="!border-ring/40"
        handleClassName="!h-2 !w-2 !rounded-sm !border !border-ring !bg-background"
      />
      <div
        className="h-full w-full"
        style={
          rotation
            ? { transform: `rotate(${rotation}deg)`, transformOrigin: "center" }
            : undefined
        }
      >
        <svg
          className="h-full w-full overflow-visible"
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
        >
          <defs>
            <ArrowMarker id={markerEndId} shape={arrowEndShape} color={stroke} end="end" />
            <ArrowMarker id={markerStartId} shape={arrowStartShape} color={stroke} end="start" />
          </defs>
          <path
            d={path}
            stroke={stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={dashed ? "6 4" : undefined}
            strokeLinecap="round"
            markerStart={arrowStart && arrowStartShape !== "none" ? `url(#${markerStartId})` : undefined}
            markerEnd={arrowEnd && arrowEndShape !== "none" ? `url(#${markerEndId})` : undefined}
          />
        </svg>
      </div>
    </div>
  );
}

export const LineNodeView = memo(LineNodeComponent);
