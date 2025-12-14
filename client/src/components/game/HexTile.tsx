import type { CSSProperties } from "react";
import { Stack, TileColor } from "@shared/types";
import "./HexTile.css";

interface HexTileProps {
  stack: Stack;
  x: number;
  y: number;
  size: number;
  isSelected: boolean;
  isLegalMove: boolean;
  isLegalDestination: boolean;
  isClickable: boolean;
  onClick: () => void;
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

// Get fill color for tile
function getTileColor(color: TileColor): string {
  switch (color) {
    case "pink":
      return "#f472b6";
    case "blue":
      return "#60a5fa";
    case "yellow":
      return "#fbbf24";
    default:
      return "#64748b";
  }
}

// Get darker shade for border
function getTileBorderColor(color: TileColor): string {
  switch (color) {
    case "pink":
      return "#ec4899";
    case "blue":
      return "#3b82f6";
    case "yellow":
      return "#f59e0b";
    default:
      return "#475569";
  }
}

function getTileGlowColor(color: TileColor): string {
  switch (color) {
    case "pink":
      return "rgba(244, 114, 182, 0.8)";
    case "blue":
      return "rgba(96, 165, 250, 0.85)";
    case "yellow":
      return "rgba(251, 191, 36, 0.8)";
    default:
      return "rgba(148, 163, 184, 0.75)";
  }
}

function HexTile({
  stack,
  x,
  y,
  size,
  isSelected,
  isLegalMove,
  isLegalDestination,
  isClickable,
  onClick,
}: HexTileProps) {
  const hexPath = getHexPath(size * 0.95);
  const topTile = stack.tiles[stack.tiles.length - 1];
  const stackHeight = stack.tiles.length;

  // Don't render empty stacks
  if (!topTile) {
    return null;
  }

  const fillColor = getTileColor(topTile.color);
  const borderColor = getTileBorderColor(topTile.color);

  // Determine border style
  let strokeColor = borderColor;
  let strokeWidth = 2;
  let className = "hex-tile";

  if (isSelected) {
    strokeColor = "#000000";
    strokeWidth = 4;
    className += ` selected selected-${topTile.color}`;
  } else if (isLegalMove || isLegalDestination) {
    strokeColor = "#000000";
    strokeWidth = 3;
    className += isLegalMove ? " legal-move" : " legal-destination";
  }

  const handleClick = isClickable ? onClick : undefined;
  const cursor =
    isClickable && (isLegalMove || isLegalDestination || isSelected)
      ? "pointer"
      : "default";

  type HexTileStyle = CSSProperties & { "--glow-color"?: string };
  const tileStyle: HexTileStyle = { cursor };

  if (isSelected) {
    tileStyle["--glow-color"] = getTileGlowColor(topTile.color);
  }

  const indicatorStroke = isLegalDestination ? "#fcd34d" : "#38bdf8";
  const indicatorFill = isLegalDestination
    ? "rgba(252, 211, 77, 0.35)"
    : "rgba(56, 189, 248, 0.22)";
  const indicatorStrokeWidth = isLegalDestination ? 5 : 4;
  const indicatorDash = isLegalDestination ? undefined : "10,6";
  const indicatorClass = `hex-indicator ${
    isLegalDestination ? "destination" : "move"
  }`;

  return (
    <g
      className={className}
      transform={`translate(${x}, ${y})`}
      onClick={handleClick}
      style={tileStyle}
    >
      {/* Shadow for depth */}
      <polygon
        points={hexPath}
        fill="rgba(0,0,0,0.2)"
        transform={`translate(2, 2)`}
      />

      {/* Main hexagon */}
      <polygon
        points={hexPath}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        className="hex-polygon"
      />

      {/* Stack height number */}
      <text
        x="0"
        y="0"
        textAnchor="middle"
        dominantBaseline="central"
        className="hex-stack-count"
        fill={topTile.color === "yellow" ? "#78350f" : "#ffffff"}
        fontSize={size * 0.5}
        fontWeight="bold"
      >
        {stackHeight}
      </text>

      {/* Selection/legal move indicator ring */}
      {(isLegalMove || isLegalDestination) && !isSelected && (
        <polygon
          points={hexPath}
          fill={indicatorFill}
          stroke={indicatorStroke}
          strokeWidth={indicatorStrokeWidth}
          strokeDasharray={indicatorDash}
          className={indicatorClass}
        />
      )}
    </g>
  );
}

export default HexTile;
