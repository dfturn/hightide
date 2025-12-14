import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { socket, connectSocket, disconnectSocket } from "../services/socket";
import {
  GameState,
  Position,
  RoundResult,
  TileColor,
  Player,
} from "@shared/types";

interface GameContextType {
  gameState: GameState | null;
  playerId: string | null;
  playerName: string;
  legalMoves: Position[];
  legalDestinations: Position[];
  error: string | null;
  roundResult: RoundResult | null;
  gameWinner: { playerId: string; color: TileColor } | null;
  isConnected: boolean;
  setPlayerName: (name: string) => void;
  createGame: () => Promise<string | null>;
  joinGame: (code: string) => Promise<boolean>;
  rejoinGame: (code: string) => Promise<boolean>;
  selectTile: (position: Position) => void;
  deselectTile: () => void;
  moveTile: (to: Position) => void;
  nextRound: () => void;
  clearError: () => void;
  clearRoundResult: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(() => {
    return sessionStorage.getItem("playerId");
  });
  const [gameCode, setGameCode] = useState<string | null>(() => {
    return sessionStorage.getItem("gameCode");
  });
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem("playerName") || "";
  });
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [legalDestinations, setLegalDestinations] = useState<Position[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [gameWinner, setGameWinner] = useState<{
    playerId: string;
    color: TileColor;
  } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Ref to track playerId for use in event handlers
  const playerIdRef = useRef<string | null>(playerId);
  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  // Save player name to localStorage
  useEffect(() => {
    if (playerName) {
      localStorage.setItem("playerName", playerName);
    }
  }, [playerName]);

  // Save playerId and gameCode to sessionStorage
  useEffect(() => {
    if (playerId) {
      sessionStorage.setItem("playerId", playerId);
    }
    if (gameCode) {
      sessionStorage.setItem("gameCode", gameCode);
    }
  }, [playerId, gameCode]);

  // Set up socket listeners
  useEffect(() => {
    connectSocket();

    const onConnect = () => {
      setIsConnected(true);

      // Auto-rejoin game if we have stored credentials
      const storedPlayerId = sessionStorage.getItem("playerId");
      const storedGameCode = sessionStorage.getItem("gameCode");
      if (storedPlayerId && storedGameCode) {
        socket.emit("rejoinGame", storedGameCode, storedPlayerId, () => {});
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onGameState = (state: GameState) => {
      // Deep clone the state to ensure React detects the change
      const clonedState: GameState = {
        ...state,
        players: state.players.map((p) => ({ ...p })),
        stacks: state.stacks.map((s) => ({
          ...s,
          position: { ...s.position },
          tiles: s.tiles.map((t) => ({ ...t })),
        })),
        selectedPosition: state.selectedPosition
          ? { ...state.selectedPosition }
          : null,
        lastMove: state.lastMove
          ? {
              from: { ...state.lastMove.from },
              to: { ...state.lastMove.to },
            }
          : null,
      };
      setGameState(clonedState);
      // Clear destinations when game state changes (new turn)
      if (!state.selectedPosition) {
        setLegalDestinations([]);
      }
    };

    const onError = (message: string) => {
      setError(message);
    };

    const onPlayerJoined = (_player: Player) => {
      // Player joined
    };

    const onPlayerLeft = (leftPlayerId: string) => {
      if (leftPlayerId !== playerIdRef.current) {
        setError("Other player has left the game");
      }
    };

    const onRoundEnd = (result: RoundResult) => {
      setRoundResult(result);
      setLegalMoves([]);
      setLegalDestinations([]);
    };

    const onGameEnd = (winnerId: string, winnerColor: TileColor) => {
      setGameWinner({ playerId: winnerId, color: winnerColor });
    };

    const onLegalMoves = (positions: Position[]) => {
      setLegalMoves(positions);
    };

    const onLegalDestinations = (positions: Position[]) => {
      setLegalDestinations(positions);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("gameState", onGameState);
    socket.on("error", onError);
    socket.on("playerJoined", onPlayerJoined);
    socket.on("playerLeft", onPlayerLeft);
    socket.on("roundEnd", onRoundEnd);
    socket.on("gameEnd", onGameEnd);
    socket.on("legalMoves", onLegalMoves);
    socket.on("legalDestinations", onLegalDestinations);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("gameState", onGameState);
      socket.off("error", onError);
      socket.off("playerJoined", onPlayerJoined);
      socket.off("playerLeft", onPlayerLeft);
      socket.off("roundEnd", onRoundEnd);
      socket.off("gameEnd", onGameEnd);
      socket.off("legalMoves", onLegalMoves);
      socket.off("legalDestinations", onLegalDestinations);
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createGame = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      socket.emit("createGame", playerName, (response) => {
        if (response.success && response.code) {
          if (response.playerId) {
            setPlayerId(response.playerId);
          }
          setGameCode(response.code);
          resolve(response.code);
        } else {
          setError(response.error || "Failed to create game");
          resolve(null);
        }
      });
    });
  }, [playerName]);

  const joinGame = useCallback(
    async (code: string): Promise<boolean> => {
      return new Promise((resolve) => {
        socket.emit("joinGame", code.toUpperCase(), playerName, (response) => {
          if (response.success) {
            if (response.playerId) {
              setPlayerId(response.playerId);
            }
            setGameCode(code.toUpperCase());
            resolve(true);
          } else {
            setError(response.error || "Failed to join game");
            resolve(false);
          }
        });
      });
    },
    [playerName]
  );

  const rejoinGame = useCallback(async (code: string): Promise<boolean> => {
    const storedPlayerId = sessionStorage.getItem("playerId");
    if (!storedPlayerId) {
      return false;
    }
    return new Promise((resolve) => {
      socket.emit(
        "rejoinGame",
        code.toUpperCase(),
        storedPlayerId,
        (response) => {
          if (response.success) {
            setPlayerId(storedPlayerId);
            setGameCode(code.toUpperCase());
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );
    });
  }, []);

  const selectTile = useCallback((position: Position) => {
    socket.emit("selectTile", position);
  }, []);

  const deselectTile = useCallback(() => {
    socket.emit("deselectTile");
    setLegalDestinations([]);
  }, []);

  const moveTile = useCallback((to: Position) => {
    socket.emit("moveTile", to);
    setLegalDestinations([]);
  }, []);

  const nextRound = useCallback(() => {
    socket.emit("nextRound");
    setRoundResult(null);
    setGameWinner(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearRoundResult = useCallback(() => {
    setRoundResult(null);
  }, []);

  const value: GameContextType = {
    gameState,
    playerId,
    playerName,
    legalMoves,
    legalDestinations,
    error,
    roundResult,
    gameWinner,
    isConnected,
    setPlayerName,
    createGame,
    joinGame,
    rejoinGame,
    selectTile,
    deselectTile,
    moveTile,
    nextRound,
    clearError,
    clearRoundResult,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
