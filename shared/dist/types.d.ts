export type TileColor = "pink" | "blue" | "yellow";
export interface Position {
    q: number;
    r: number;
}
export interface Tile {
    id: string;
    color: TileColor;
}
export interface Stack {
    position: Position;
    tiles: Tile[];
}
export interface Player {
    id: string;
    name: string;
    color: "pink" | "blue";
    score: number;
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
    createGame: (playerName: string, callback: (response: {
        success: boolean;
        code?: string;
        playerId?: string;
        error?: string;
    }) => void) => void;
    joinGame: (code: string, playerName: string, callback: (response: {
        success: boolean;
        playerId?: string;
        error?: string;
    }) => void) => void;
    rejoinGame: (code: string, playerId: string, callback: (response: {
        success: boolean;
        error?: string;
    }) => void) => void;
    selectTile: (position: Position) => void;
    moveTile: (to: Position) => void;
    deselectTile: () => void;
    nextRound: () => void;
}
export declare function positionKey(pos: Position): string;
export declare function parsePositionKey(key: string): Position;
export declare function positionsEqual(a: Position, b: Position): boolean;
export declare const HEX_DIRECTIONS: Position[];
export declare function getNeighborPosition(pos: Position, direction: Position): Position;
export declare function getNeighborPositions(pos: Position): Position[];
