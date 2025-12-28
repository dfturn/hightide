import { useState } from "react";
import GameLayout from "../components/game/GameLayout";
import GameHeader from "../components/game/GameHeader";
import HexGrid from "../components/game/HexGrid";
import ScoreBoard from "../components/game/ScoreBoard";
import PlayerIndicator from "../components/game/PlayerIndicator";
import Toast from "../components/common/Toast";
import { GameState, Position, RoundResult } from "@shared/types";
import { createInitialBoard } from "../../../server/src/gameLogic";

// Mock game state for development
function createMockGameState(): GameState {
  return {
    id: "dev-game",
    code: "DEV123",
    players: [
      { id: "player1", name: "You", color: "pink", score: 1 },
      { id: "player2", name: "Opponent", color: "blue", score: 0 },
    ],
    stacks: createInitialBoard(),
    currentPlayerId: "player1",
    currentPlayerColor: "pink",
    phase: "playing",
    roundNumber: 2,
    firstPlayerColor: "pink",
    selectedPosition: null,
    winner: null,
    roundWinner: null,
    lastMovePlayerId: null,
    lastMove: null,
  };
}

function DevGamePage() {
  const [gameState] = useState<GameState>(createMockGameState());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null
  );
  const [legalMoves] = useState<Position[]>([]);
  const [legalDestinations] = useState<Position[]>([]);
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [roundResult] = useState<RoundResult>({
    pinkVisible: 8,
    blueVisible: 6,
    winnerId: "player1",
    winnerColor: "pink",
    tiebreaker: "visible",
  });

  const playerId = "player1";
  const currentPlayer = gameState.players.find((p) => p.id === playerId);
  const opponent = gameState.players.find((p) => p.id !== playerId);
  const isMyTurn = gameState.currentPlayerId === playerId;

  const handleTileClick = (q: number, r: number) => {
    const position = { q, r };

    // Just toggle selection for demo purposes
    if (
      selectedPosition &&
      selectedPosition.q === q &&
      selectedPosition.r === r
    ) {
      setSelectedPosition(null);
    } else {
      setSelectedPosition(position);
    }
  };

  const handleResign = () => {
    alert("Resign functionality - in real game, this would end the round");
  };

  const handleNextRound = () => {
    setShowRoundResult(false);
  };

  const handleShowToast = () => {
    setShowRoundResult(true);
  };

  // Build toast message
  let toastMessage = "";
  let toastAction = "";

  if (showRoundResult && roundResult) {
    const winner = gameState.players.find((p) => p.id === roundResult.winnerId);
    const isWinner = roundResult.winnerId === playerId;

    if (roundResult.tiebreaker === "resignation") {
      toastMessage = `Round ${gameState.roundNumber} complete! `;
      if (isWinner) {
        toastMessage += "Your opponent resigned. You win this round!";
      } else {
        toastMessage += "You resigned this round.";
      }
    } else {
      toastMessage = `Round ${gameState.roundNumber} complete! `;
      toastMessage += `Pink: ${roundResult.pinkVisible} | Blue: ${roundResult.blueVisible}. `;

      if (winner) {
        toastMessage += isWinner
          ? "You win this round!"
          : `${winner.name} wins this round!`;
      }
    }

    toastAction = "Next Round";
  }

  return (
    <GameLayout>
      <GameHeader
        gameCode={gameState.code}
        showResignButton={isMyTurn && gameState.phase === "playing"}
        onResign={handleResign}
      />

      <ScoreBoard players={gameState.players} currentPlayerId={playerId} />

      <div style={{ padding: "1rem", textAlign: "center" }}>
        <button
          onClick={handleShowToast}
          style={{
            padding: "0.5rem 1rem",
            background: "var(--color-pink)",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Test Round End Toast
        </button>
      </div>

      <PlayerIndicator
        isMyTurn={isMyTurn}
        currentPlayerColor={gameState.currentPlayerColor}
        myColor={currentPlayer?.color}
        opponentName={opponent?.name}
        phase={gameState.phase}
      />

      <HexGrid
        stacks={gameState.stacks}
        selectedPosition={selectedPosition}
        legalMoves={legalMoves}
        legalDestinations={legalDestinations}
        lastMove={null}
        isMyTurn={isMyTurn}
        onTileClick={handleTileClick}
      />

      {showRoundResult && roundResult && (
        <Toast
          message={toastMessage}
          actionLabel={toastAction}
          onAction={handleNextRound}
          onClose={() => setShowRoundResult(false)}
        />
      )}
    </GameLayout>
  );
}

export default DevGamePage;
