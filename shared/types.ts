// Shared types for High Tide game

export type TileColor = "pink" | "blue" | "yellow";

export interface Position {
  q: number; // axial coordinate
  r: number; // axial coordinate
}

export interface Tile {
  id: string;
  color: TileColor;
}

export interface Stack {
  position: Position;
  tiles: Tile[]; // bottom to top
}

export interface Player {
  id: string;
  name: string;
  color: "pink" | "blue";
  score: number; // rounds won
}

export interface GameState {
  id: string;
  code: string;
  players: Player[];
  stacks: Stack[];
  currentPlayerId: string | null;
  currentPlayerColor: TileColor | null;
  phase: "waiting" | "playing" | "round_end" | "game_end";
  roundNumber: number;
  firstPlayerColor: TileColor;
  selectedPosition: Position | null;
  winner: string | null;
  roundWinner: string | null;
  lastMovePlayerId: string | null;
  lastMove: Move | null;
}

export interface Move {
  from: Position;
  to: Position;
}

export interface RoundResult {
  pinkVisible: number;
  blueVisible: number;
  winnerId: string | null;
  winnerColor: TileColor | null;
  tiebreaker: "visible" | "highest_stack" | "last_move" | null;
}

// Socket events
export interface ServerToClientEvents {
  gameState: (state: GameState) => void;
  error: (message: string) => void;
  playerJoined: (player: Player) => void;
  playerLeft: (playerId: string) => void;
  roundEnd: (result: RoundResult) => void;
  gameEnd: (winnerId: string, winnerColor: TileColor) => void;
  legalMoves: (positions: Position[]) => void;
  legalDestinations: (positions: Position[]) => void;
}

export interface ClientToServerEvents {
  createGame: (
    playerName: string,
    callback: (response: {
      success: boolean;
      code?: string;
      playerId?: string;
      error?: string;
    }) => void
  ) => void;
  joinGame: (
    code: string,
    playerName: string,
    callback: (response: {
      success: boolean;
      playerId?: string;
      error?: string;
    }) => void
  ) => void;
  rejoinGame: (
    code: string,
    playerId: string,
    callback: (response: { success: boolean; error?: string }) => void
  ) => void;
  selectTile: (position: Position) => void;
  moveTile: (to: Position) => void;
  deselectTile: () => void;
  nextRound: () => void;
}

// Utility functions for hex coordinates
export function positionKey(pos: Position): string {
  return `${pos.q},${pos.r}`;
}

export function parsePositionKey(key: string): Position {
  const [q, r] = key.split(",").map(Number);
  return { q, r };
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.q === b.q && a.r === b.r;
}

// Axial coordinate directions for hex grid (pointy-top)
export const HEX_DIRECTIONS: Position[] = [
  { q: 1, r: 0 }, // East
  { q: 1, r: -1 }, // Northeast
  { q: 0, r: -1 }, // Northwest
  { q: -1, r: 0 }, // West
  { q: -1, r: 1 }, // Southwest
  { q: 0, r: 1 }, // Southeast
];

export function getNeighborPosition(
  pos: Position,
  direction: Position
): Position {
  return { q: pos.q + direction.q, r: pos.r + direction.r };
}

export function getNeighborPositions(pos: Position): Position[] {
  return HEX_DIRECTIONS.map((dir) => getNeighborPosition(pos, dir));
}
