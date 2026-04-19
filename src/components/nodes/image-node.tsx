import { memo } from "react";
import {
  Handle,
  NodeResizer,
  Position,
  type NodeProps,
} from "@xyflow/react";
import type { ImageNode } from "@/store/flow-store";
import { cn } from "@/lib/utils";

const HANDLE_POSITIONS: { pos: Position; key: string }[] = [
  { pos: Position.Top, key: "top" },
  { pos: Position.Right, key: "right" },
  { pos: Position.Bottom, key: "bottom" },
  { pos: Position.Left, key: "left" },
];

function ImageNodeComponent({ data, selected }: NodeProps<ImageNode>) {
  const hasBg = !!data.bgColor;
  const hasBorder = !!data.borderColor;
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-md border",
        !hasBg && "bg-card",
        !hasBorder && "border-border"
      )}
      style={{
        ...(hasBg ? { backgroundColor: data.bgColor } : {}),
        ...(hasBorder ? { borderColor: data.borderColor } : {}),
        ...(typeof data.borderRadius === "number"
          ? { borderRadius: data.borderRadius }
          : {}),
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={40}
        minHeight={40}
        keepAspectRatio
        lineClassName="!border-ring/40"
        handleClassName="!h-2 !w-2 !rounded-sm !border !border-ring !bg-background"
      />
      {HANDLE_POSITIONS.map(({ pos, key }) => (
        <Handle key={key} type="source" position={pos} id={key} />
      ))}
      <img
        src={data.src}
        alt={data.alt ?? ""}
        className="pointer-events-none h-full w-full select-none object-contain"
        draggable={false}
      />
    </div>
  );
}

export const ImageNodeView = memo(ImageNodeComponent);
