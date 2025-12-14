import { Stack, Position, positionsEqual, Move } from "@shared/types";
import HexTile from "./HexTile";
import "./HexGrid.css";

interface HexGridProps {
  stacks: Stack[];
  selectedPosition: Position | null;
  legalMoves: Position[];
  legalDestinations: Position[];
  lastMove: Move | null;
  isMyTurn: boolean;
  onTileClick: (q: number, r: number) => void;
}

// Generate pointy-top hexagon path
function getHexPath(size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = size * Math.cos(angle);
    const py = size * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  return points.join(" ");
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
  lastMove,
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

  const showLastMove = Boolean(isMyTurn && lastMove);
  const lastMovePathOuter = getHexPath(hexSize * 1.05);
  const lastMovePathInner = getHexPath(hexSize * 0.55);

  return (
    <div className="hex-grid-container" key={gridKey}>
      <svg
        className="hex-grid-svg"
        viewBox={`0 0 ${gridWidth} ${gridHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${offsetX}, ${offsetY})`}>
          {hexPositions.map(({ position, stack, pixel }) => {
            const isLastMoveFrom =
              showLastMove &&
              lastMove &&
              positionsEqual(position, lastMove.from);
            const isLastMoveTo =
              showLastMove && lastMove && positionsEqual(position, lastMove.to);

            // Skip positions with no stack and no last-move indicator
            if (!stack) {
              return null;
            }

            const hasTiles = stack.tiles.length > 0;
            if (!hasTiles && !(isLastMoveFrom || isLastMoveTo)) {
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
              hasTiles &&
              isMyTurn &&
              (isLegalMove || isLegalDestination || isSelected);

            return (
              <g key={`${position.q},${position.r}`}>
                {hasTiles && (
                  <HexTile
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
                )}

                {(isLastMoveFrom || isLastMoveTo) && (
                  <g
                    className={`last-move-indicator ${
                      isLastMoveTo ? "to" : "from"
                    }`}
                    transform={`translate(${pixel.x}, ${pixel.y})`}
                  >
                    <polygon
                      points={lastMovePathOuter}
                      fill={
                        isLastMoveTo
                          ? "rgba(244, 63, 94, 0.18)"
                          : "rgba(192, 132, 252, 0.18)"
                      }
                      stroke={isLastMoveTo ? "#f43f5e" : "#a855f7"}
                      strokeWidth={isLastMoveTo ? 5 : 4}
                      strokeDasharray={isLastMoveTo ? undefined : "7 6"}
                    />
                    <polygon
                      points={lastMovePathInner}
                      fill={
                        isLastMoveTo
                          ? "rgba(244, 63, 94, 0.35)"
                          : "rgba(192, 132, 252, 0.3)"
                      }
                      stroke={isLastMoveTo ? "#fb7185" : "#c084fc"}
                      strokeWidth={2.5}
                      strokeDasharray={isLastMoveTo ? "9 4" : "4 4"}
                    />
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default HexGrid;
