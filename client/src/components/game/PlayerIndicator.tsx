import { TileColor } from "@shared/types";
import "./PlayerIndicator.css";

interface PlayerIndicatorProps {
  isMyTurn: boolean;
  currentPlayerColor: TileColor | null;
  myColor?: "pink" | "blue";
  opponentName: string | undefined;
  phase: string;
}

function PlayerIndicator({
  isMyTurn,
  currentPlayerColor,
  opponentName,
  phase,
}: PlayerIndicatorProps) {
  if (phase !== "playing") {
    return null;
  }

  const message = isMyTurn
    ? "Your turn"
    : `${opponentName || "Opponent"}'s turn`;

  const colorClass = currentPlayerColor === "pink" ? "pink" : "blue";

  return (
    <div
      className={`player-indicator ${colorClass} ${
        isMyTurn ? "is-my-turn" : ""
      }`}
    >
      <span className="player-indicator-dot" />
      <span className="player-indicator-text">{message}</span>
    </div>
  );
}

export default PlayerIndicator;
