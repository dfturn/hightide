# High Tide

A two-player abstract strategy board game built with React, Node.js, and Socket.io.

## Game Overview

High Tide is played on a 19-hex board. Players compete to have the most visible tiles of their color when the game ends.

### Rules

- **Players**: 2 (Pink and Blue)
- **Tiles**: 7 pink, 7 blue, 5 yellow (neutral)
- **Setup**: Yellow tile in center, 2 of each color on the 6 adjacent hexes, remaining tiles randomly on outer hexes

**Movement Rules**:

1. On your turn, move one of your tiles or a yellow tile
2. A tile must have at least 2 free adjacent sides to move
3. Tiles can only move to adjacent occupied hexes
4. A tile must move to a **higher** position (destination stack height after move > origin stack height before move)
5. Moving a tile cannot isolate any tiles (board must remain contiguous)

**Winning**:

- Round ends when a player has no legal moves
- Player with more visible tiles wins the round
- Tiebreakers: (1) highest stack of their color, (2) last move made
- First to win 2 rounds wins the game

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express, Socket.io
- **Shared**: TypeScript types and utilities shared between client/server

## Project Structure

```
hightide/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/     # Shared UI components
│   │   │   ├── game/       # Game board components
│   │   │   └── lobby/      # Lobby/matchmaking components
│   │   ├── context/        # React context (GameContext)
│   │   ├── pages/          # Page components
│   │   └── services/       # Socket.io client
│   └── package.json
├── server/           # Node.js backend
│   ├── src/
│   │   ├── index.ts        # Express server entry
│   │   ├── socketHandler.ts # Socket.io event handlers
│   │   └── gameLogic.ts    # Game rules and validation
│   └── package.json
├── shared/           # Shared types
│   └── types.ts      # TypeScript interfaces and utilities
├── Dockerfile        # Production container
├── .dockerignore
└── package.json      # Workspace root
```

## Development

### Prerequisites

- Node.js 20+
- npm 9+

### Setup

```bash
# Install all dependencies (uses npm workspaces)
npm install
```

### Running Locally

```bash
# Start both client and server in development mode
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

#### Development Mode (No Multiplayer Needed)

For UI development and testing without needing two players:

1. Start the dev server: `npm run dev`
2. Navigate to http://localhost:5173/dev

This displays a mock game page with:

- Full game board with random initial state
- Functional resign button
- Test button to trigger round end toast
- All UI components visible
- No socket connection required

Alternatively, click "Dev Mode" link at the bottom of the lobby page.

### Building

```bash
# Build all packages (shared, client, server)
npm run build
```

### Individual Workspace Commands

```bash
# Client only
npm run dev --workspace=client
npm run build --workspace=client

# Server only
npm run dev --workspace=server
npm run build --workspace=server

# Shared types
npm run build --workspace=shared
```

## Production Deployment

### Docker

```bash
# Build the image
docker build -t hightide .

# Run the container
docker run -p 3001:3001 hightide
```

The container serves both the API and static frontend at http://localhost:3001

### Environment Variables

| Variable   | Default | Description                                 |
| ---------- | ------- | ------------------------------------------- |
| `PORT`     | `3001`  | Server port                                 |
| `NODE_ENV` | -       | Set to `production` for static file serving |

## Architecture Notes

### Game State Management

- Server is authoritative for all game state
- Client sends actions via Socket.io events
- Server validates moves and broadcasts updated state to all players

### Key Socket Events

**Client → Server**:

- `createGame` - Create a new game room
- `joinGame` - Join existing game by code
- `rejoinGame` - Reconnect to game after disconnect
- `selectTile` - Select a tile to move
- `moveTile` - Move selected tile to destination
- `deselectTile` - Cancel tile selection
- `nextRound` - Start next round after round end

**Server → Client**:

- `gameState` - Full game state update
- `legalMoves` - Positions of tiles the current player can move
- `legalDestinations` - Valid destinations for selected tile
- `roundEnd` - Round result with winner and scores
- `gameEnd` - Game over with final winner
- `error` - Error message

### Game Logic (`server/src/gameLogic.ts`)

Key functions:

- `createInitialBoard()` - Generate starting board state
- `getValidDestinations()` - Get legal moves for a tile
- `executeMove()` - Apply a move to the board
- `determineRoundWinner()` - Calculate round winner with tiebreakers
- `hasLegalMoves()` - Check if a player can move

## Contributing

1. Game logic changes go in `server/src/gameLogic.ts`
2. UI components go in `client/src/components/`
3. Shared types go in `shared/types.ts`
4. Run `npm run build` to verify TypeScript compilation
5. Test with `npm run dev` before committing

## License

MIT
