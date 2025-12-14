import { Stack, Position, positionsEqual } from "@shared/types";
import HexTile from "./HexTile";
import "./HexGrid.css";

interface HexGridProps {
  stacks: Stack[];
  selectedPosition: Position | null;
  legalMoves: Position[];
  legalDestinations: Position[];
  isMyTurn: boolean;
  onTileClick: (q: number, r: number) => void;
}

// Convert axial coordinates to pixel position
function axialToPixel(
  q: number,
  r: number,
  size: number
): { x: number; y: number } {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = size * ((3 / 2) * r);
  return { x, y };
}

function HexGrid({
  stacks,
  selectedPosition,
  legalMoves,
  legalDestinations,
  isMyTurn,
  onTileClick,
}: HexGridProps) {
  // Calculate hex size based on viewport
  const hexSize = 40; // Base size in pixels

  // Create a key based on the stacks state to force re-render
  const gridKey = stacks
    .map((s) => `${s.position.q},${s.position.r}:${s.tiles.length}`)
    .join("|");

  // Generate all 19 hex positions (radius 2 hexagonal grid)
  // This ensures the grid stays stable even when tiles move
  const allPositions: Position[] = [];
  const radius = 2;
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      allPositions.push({ q, r });
    }
  }

  // Calculate grid bounds based on ALL positions (not just stacks with tiles)
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;

  const hexPositions = allPositions.map((position) => {
    const pixel = axialToPixel(position.q, position.r, hexSize);
    minX = Math.min(minX, pixel.x);
    maxX = Math.max(maxX, pixel.x);
    minY = Math.min(minY, pixel.y);
    maxY = Math.max(maxY, pixel.y);

    // Find the stack at this position (if any)
    const stack = stacks.find((s) => positionsEqual(s.position, position));
    return { position, stack, pixel };
  });

  // Add padding for hex size
  const padding = hexSize * 1.5;
  const gridWidth = maxX - minX + padding * 2;
  const gridHeight = maxY - minY + padding * 2;
  const offsetX = -minX + padding;
  const offsetY = -minY + padding;

  return (
    <div className="hex-grid-container" key={gridKey}>
      <svg
        className="hex-grid-svg"
        viewBox={`0 0 ${gridWidth} ${gridHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${offsetX}, ${offsetY})`}>
          {hexPositions.map(({ position, stack, pixel }) => {
            // Skip positions with no stack or no tiles
            if (!stack || stack.tiles.length === 0) {
              return null;
            }

            const isSelected = selectedPosition
              ? positionsEqual(position, selectedPosition)
              : false;
            const isLegalMove = legalMoves.some((p) =>
              positionsEqual(p, position)
            );
            const isLegalDestination = legalDestinations.some((p) =>
              positionsEqual(p, position)
            );

            // Only clickable if it's my turn and the tile is selectable or is a valid destination
            const isClickable =
              isMyTurn && (isLegalMove || isLegalDestination || isSelected);

            return (
              <HexTile
                key={`${position.q},${position.r}`}
                stack={stack}
                x={pixel.x}
                y={pixel.y}
                size={hexSize}
                isSelected={isSelected || false}
                isLegalMove={isLegalMove}
                isLegalDestination={isLegalDestination}
                isClickable={isClickable}
                onClick={() => onTileClick(position.q, position.r)}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default HexGrid;
