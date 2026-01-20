import React from "react";
import { cn } from "@/lib/utils";
import type { VenueData } from "@/data/venues";
import type { VenueLayout, LayoutMode, LayoutInventory } from "@/data/venueLayouts";
import { buildSeatGrid } from "@/utils/layoutRender";

type SchematicVariant = "before" | "after";

type SpacePlannerSchematicProps = {
  venue: VenueData;
  layout: VenueLayout;
  guestCount: number;
  inventory?: LayoutInventory;
  mode: LayoutMode;
  variant?: SchematicVariant;
  className?: string;
};

const SVG_WIDTH = 640;
const SVG_HEIGHT = 360;

const SpacePlannerSchematic: React.FC<SpacePlannerSchematicProps> = ({
  venue,
  layout,
  guestCount,
  inventory,
  mode,
  variant = "after",
  className
}) => {
  const padding = 24;
  const gap = 10;
  const innerWidth = SVG_WIDTH - padding * 2;
  const innerHeight = SVG_HEIGHT - padding * 2;
  const availableHeight = innerHeight - gap * 2;

  const stageHeight = Math.max(40, (availableHeight * layout.zoneConfig.stageAreaPct) / 100);
  const seatingHeight = Math.max(90, (availableHeight * layout.zoneConfig.seatingAreaPct) / 100);
  const remainingHeight = Math.max(60, availableHeight - stageHeight - seatingHeight);

  const stageRect = {
    x: padding,
    y: padding,
    width: innerWidth,
    height: stageHeight
  };
  const seatingRect = {
    x: padding,
    y: padding + stageHeight + gap,
    width: innerWidth,
    height: seatingHeight
  };
  const bottomRect = {
    x: padding,
    y: padding + stageHeight + gap + seatingHeight + gap,
    width: innerWidth,
    height: remainingHeight
  };

  const cateringRatio =
    layout.zoneConfig.cateringAreaPct /
    (layout.zoneConfig.cateringAreaPct + layout.zoneConfig.avAreaPct);
  const cateringWidth = bottomRect.width * cateringRatio;
  const cateringRect = {
    x: bottomRect.x,
    y: bottomRect.y,
    width: cateringWidth,
    height: bottomRect.height
  };
  const avRect = {
    x: bottomRect.x + cateringWidth + gap,
    y: bottomRect.y,
    width: bottomRect.width - cateringWidth - gap,
    height: bottomRect.height
  };

  const resolvedInventory = inventory ?? layout.baselineInventory;
  const seatBlocks = buildSeatGrid({
    seatCount: Math.max(resolvedInventory.chairs, guestCount),
    area: {
      x: seatingRect.x + 16,
      y: seatingRect.y + 16,
      width: seatingRect.width - 32,
      height: seatingRect.height - 32
    }
  });

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="rounded-2xl border border-brand-dark/10 bg-white/70 p-4 shadow-soft">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
          <span>{venue.name}</span>
          <span>{mode === "optimized" ? "Optimized Layout" : "Max Layout"}</span>
        </div>
        <svg
          role="img"
          aria-labelledby={`venue-blueprint-${venue.id}-${mode}-${variant}`}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="mt-4 h-auto w-full"
        >
          <title id={`venue-blueprint-${venue.id}-${mode}-${variant}`}>
            {venue.name} schematic blueprint
          </title>
          <rect
            x={8}
            y={8}
            width={SVG_WIDTH - 16}
            height={SVG_HEIGHT - 16}
            rx={28}
            className="fill-brand-light/80 stroke-brand-dark/15"
          />

          {variant === "before" ? (
            <g>
              <rect
                x={padding}
                y={padding}
                width={innerWidth}
                height={innerHeight}
                rx={18}
                className="fill-white/80 stroke-brand-dark/10"
              />
              <text
                x={SVG_WIDTH / 2}
                y={SVG_HEIGHT / 2}
                textAnchor="middle"
                className="fill-brand-dark/40 text-[16px] font-semibold"
              >
                Empty shell
              </text>
            </g>
          ) : (
            <g>
              <rect
                x={stageRect.x}
                y={stageRect.y}
                width={stageRect.width}
                height={stageRect.height}
                rx={16}
                className="fill-brand-dark/90 stroke-brand-dark"
              />
              <text
                x={stageRect.x + stageRect.width / 2}
                y={stageRect.y + stageRect.height / 2 + 5}
                textAnchor="middle"
                className="fill-brand-light text-[12px] font-semibold"
              >
                Stage
              </text>

              <rect
                x={seatingRect.x}
                y={seatingRect.y}
                width={seatingRect.width}
                height={seatingRect.height}
                rx={18}
                className="fill-brand-cream/70 stroke-brand-dark/10"
              />
              <text
                x={seatingRect.x + 20}
                y={seatingRect.y + 28}
                className="fill-brand-dark/70 text-[12px] font-semibold"
              >
                Seating
              </text>
              {seatBlocks.map((block) => (
                <g key={`${block.x}-${block.y}`}>
                  <rect
                    x={block.x}
                    y={block.y}
                    width={block.width}
                    height={block.height}
                    rx={8}
                    className="fill-white/90 stroke-brand-dark/15"
                  />
                  <text
                    x={block.x + block.width / 2}
                    y={block.y + block.height / 2 + 4}
                    textAnchor="middle"
                    className="fill-brand-dark/50 text-[10px] font-semibold"
                  >
                    {block.seats}
                  </text>
                </g>
              ))}

              <rect
                x={cateringRect.x}
                y={cateringRect.y}
                width={cateringRect.width}
                height={cateringRect.height}
                rx={16}
                className="fill-brand-blue/60 stroke-brand-dark/10"
              />
              <text
                x={cateringRect.x + 16}
                y={cateringRect.y + 24}
                className="fill-brand-dark/70 text-[12px] font-semibold"
              >
                Catering
              </text>

              <rect
                x={avRect.x}
                y={avRect.y}
                width={avRect.width}
                height={avRect.height}
                rx={16}
                className="fill-brand-teal/40 stroke-brand-dark/10"
              />
              <text
                x={avRect.x + 16}
                y={avRect.y + 24}
                className="fill-brand-dark/70 text-[12px] font-semibold"
              >
                AV
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-dark/10 bg-white/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark/50">
        <span>Chairs {resolvedInventory.chairs}</span>
        <span>Tables {resolvedInventory.tables}</span>
        <span>Stage {resolvedInventory.stageModules}</span>
        <span>Buffet {resolvedInventory.buffetStations}</span>
      </div>
    </div>
  );
};

export default SpacePlannerSchematic;
