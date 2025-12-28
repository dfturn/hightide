import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import LobbyLayout from "../components/lobby/LobbyLayout";
import LobbyHeader from "../components/lobby/LobbyHeader";
import NameInput from "../components/lobby/NameInput";
import CreateGameButton from "../components/lobby/CreateGameButton";
import JoinGameForm from "../components/lobby/JoinGameForm";
import Divider from "../components/common/Divider";
import ErrorMessage from "../components/common/ErrorMessage";
import WaitingRoom from "../components/lobby/WaitingRoom";

function LobbyPage() {
  const navigate = useNavigate();
  const {
    playerName,
    setPlayerName,
    createGame,
    joinGame,
    error,
    clearError,
    gameState,
    isConnected,
  } = useGame();

  const [gameCode, setGameCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const handleCreateGame = async () => {
    if (!playerName.trim()) return;

    setIsCreating(true);
    clearError();

    const code = await createGame();
    if (code) {
      setCreatedCode(code);
    }

    setIsCreating(false);
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !gameCode.trim()) return;

    setIsJoining(true);
    clearError();

    const success = await joinGame(gameCode);
    if (success) {
      navigate(`/game/${gameCode.toUpperCase()}`);
    }

    setIsJoining(false);
  };

  // If game started (both players joined), navigate to game
  useEffect(() => {
    if (
      gameState &&
      gameState.players.length === 2 &&
      gameState.phase === "playing"
    ) {
      navigate(`/game/${gameState.code}`);
    }
  }, [gameState, navigate]);

  // Show waiting room if game was created
  if (createdCode && gameState) {
    return (
      <WaitingRoom
        gameCode={createdCode}
        onCancel={() => {
          setCreatedCode(null);
        }}
      />
    );
  }

  const isNameValid = playerName.trim().length >= 1;
  const isCodeValid = gameCode.trim().length === 6;

  return (
    <LobbyLayout>
      <LobbyHeader />

      {!isConnected && <ErrorMessage message="Connecting to server..." />}

      {error && <ErrorMessage message={error} onDismiss={clearError} />}

      <NameInput
        value={playerName}
        onChange={setPlayerName}
        disabled={isCreating || isJoining}
      />

      <CreateGameButton
        onClick={handleCreateGame}
        disabled={!isNameValid || !isConnected}
        loading={isCreating}
      />

      <Divider text="or" />

      <JoinGameForm
        code={gameCode}
        onCodeChange={setGameCode}
        onSubmit={handleJoinGame}
        disabled={!isNameValid || !isCodeValid || !isConnected}
        loading={isJoining}
      />

      {/* Development Mode Link */}
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <a
          href="/dev"
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.75rem",
            textDecoration: "none",
            opacity: 0.6,
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "0.6")}
        >
          Dev Mode (No multiplayer needed)
        </a>
      </div>
    </LobbyLayout>
  );
}

export default LobbyPage;
