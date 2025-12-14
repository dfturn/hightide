import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import GameLayout from "../components/game/GameLayout";
import GameHeader from "../components/game/GameHeader";
import HexGrid from "../components/game/HexGrid";
import ScoreBoard from "../components/game/ScoreBoard";
import PlayerIndicator from "../components/game/PlayerIndicator";
import Toast from "../components/common/Toast";

function GamePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [hasAttemptedRejoin, setHasAttemptedRejoin] = useState(false);
  const {
    gameState,
    playerId,
    legalMoves,
    legalDestinations,
    roundResult,
    gameWinner,
    selectTile,
    deselectTile,
    moveTile,
    nextRound,
    clearRoundResult,
    rejoinGame,
    isConnected,
  } = useGame();

  // Try to rejoin game when page loads
  useEffect(() => {
    if (!code || hasAttemptedRejoin || !isConnected) return;

    // Always rejoin to ensure socket is associated with game
    setHasAttemptedRejoin(true);
    rejoinGame(code).then((success) => {
      if (!success) {
        navigate("/");
      }
    });
  }, [code, hasAttemptedRejoin, isConnected, navigate, rejoinGame]);

  // Redirect to lobby if no game state after rejoin attempt
  useEffect(() => {
    if (hasAttemptedRejoin && !gameState) {
      const timer = setTimeout(() => {
        if (!gameState) {
          navigate("/");
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasAttemptedRejoin, gameState, navigate]);

  if (!gameState || !playerId) {
    return (
      <GameLayout>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "var(--color-text-muted)",
          }}
        >
          Loading game...
        </div>
      </GameLayout>
    );
  }

  const currentPlayer = gameState.players.find((p) => p.id === playerId);
  const opponent = gameState.players.find((p) => p.id !== playerId);
  const isMyTurn = gameState.currentPlayerId === playerId;

  const handleTileClick = (q: number, r: number) => {
    if (!isMyTurn || gameState.phase !== "playing") return;

    const position = { q, r };

    // If a tile is already selected
    if (gameState.selectedPosition) {
      // If clicking the same tile, deselect
      if (
        gameState.selectedPosition.q === q &&
        gameState.selectedPosition.r === r
      ) {
        deselectTile();
        return;
      }

      // If clicking a valid destination, move there
      const isValidDestination = legalDestinations.some(
        (dest) => dest.q === q && dest.r === r
      );

      if (isValidDestination) {
        moveTile(position);
        return;
      }

      // If clicking another legal tile, select it instead
      const isLegalTile = legalMoves.some(
        (move) => move.q === q && move.r === r
      );

      if (isLegalTile) {
        selectTile(position);
        return;
      }

      // Otherwise, deselect
      deselectTile();
      return;
    }

    // No tile selected yet - select if legal
    const isLegalTile = legalMoves.some((move) => move.q === q && move.r === r);

    if (isLegalTile) {
      selectTile(position);
    }
  };

  // Build toast message
  let toastMessage = "";
  let toastAction = "";

  if (roundResult) {
    const winner = gameState.players.find((p) => p.id === roundResult.winnerId);
    const isWinner = roundResult.winnerId === playerId;

    toastMessage = `Round ${gameState.roundNumber} complete! `;
    toastMessage += `Pink: ${roundResult.pinkVisible} | Blue: ${roundResult.blueVisible}. `;

    if (winner) {
      toastMessage += isWinner
        ? "You win this round!"
        : `${winner.name} wins this round!`;
    }

    if (gameWinner) {
      const gameWinnerPlayer = gameState.players.find(
        (p) => p.id === gameWinner.playerId
      );
      toastMessage =
        gameWinner.playerId === playerId
          ? "🎉 You won the game!"
          : `${gameWinnerPlayer?.name} won the game!`;
      toastAction = "New Game";
    } else {
      toastAction = "Next Round";
    }
  }

  return (
    <GameLayout>
      <GameHeader gameCode={code || ""} />

      <ScoreBoard players={gameState.players} currentPlayerId={playerId} />

      <PlayerIndicator
        isMyTurn={isMyTurn}
        currentPlayerColor={gameState.currentPlayerColor}
        myColor={currentPlayer?.color}
        opponentName={opponent?.name}
        phase={gameState.phase}
      />

      <HexGrid
        stacks={gameState.stacks}
        selectedPosition={gameState.selectedPosition}
        legalMoves={legalMoves}
        legalDestinations={legalDestinations}
        isMyTurn={isMyTurn}
        onTileClick={handleTileClick}
      />

      {roundResult && (
        <Toast
          message={toastMessage}
          actionLabel={toastAction}
          onAction={nextRound}
          onClose={clearRoundResult}
        />
      )}
    </GameLayout>
  );
}

export default GamePage;
