"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocketServer = initializeSocketServer;
const socket_io_1 = require("socket.io");
const types_1 = require("../../shared/types");
const gameLogic_1 = require("./gameLogic");
const games = new Map();
function generatePlayerId() {
    return Math.random().toString(36).substring(2, 15);
}
function getOtherPlayerColor(color) {
    return color === "pink" ? "blue" : "pink";
}
function getPlayerByColor(game, color) {
    return game.players.find((p) => p.color === color);
}
function switchTurn(game) {
    const currentColor = game.currentPlayerColor;
    if (!currentColor || currentColor === "yellow")
        return;
    const nextColor = getOtherPlayerColor(currentColor);
    const nextPlayer = getPlayerByColor(game, nextColor);
    if (nextPlayer) {
        game.currentPlayerId = nextPlayer.id;
        game.currentPlayerColor = nextColor;
    }
}
function startGame(room) {
    const { game } = room;
    // Reset board
    game.stacks = (0, gameLogic_1.createInitialBoard)();
    game.phase = "playing";
    game.selectedPosition = null;
    game.roundWinner = null;
    // Set first player
    const firstPlayer = getPlayerByColor(game, game.firstPlayerColor);
    if (firstPlayer) {
        game.currentPlayerId = firstPlayer.id;
        game.currentPlayerColor = game.firstPlayerColor;
    }
    broadcastGameState(room);
}
function startNextRound(room, loserColor) {
    const { game } = room;
    // Reset board
    game.stacks = (0, gameLogic_1.createInitialBoard)();
    game.phase = "playing";
    game.selectedPosition = null;
    game.roundWinner = null;
    game.roundNumber++;
    // Loser starts next round
    game.firstPlayerColor = loserColor;
    const firstPlayer = getPlayerByColor(game, loserColor);
    if (firstPlayer) {
        game.currentPlayerId = firstPlayer.id;
        game.currentPlayerColor = loserColor;
    }
    broadcastGameState(room);
}
function broadcastGameState(room) {
    room.sockets.forEach((socket, _playerId) => {
        if (socket.connected) {
            socket.emit("gameState", room.game);
        }
    });
}
function broadcastLegalMoves(room) {
    const { game } = room;
    if (game.phase !== "playing" || !game.currentPlayerColor)
        return;
    const legalPositions = (0, gameLogic_1.getLegalTilePositions)(game.stacks, game.currentPlayerColor);
    room.sockets.forEach((socket, playerId) => {
        if (playerId === game.currentPlayerId) {
            socket.emit("legalMoves", legalPositions);
        }
        else {
            socket.emit("legalMoves", []);
        }
    });
}
function checkRoundEnd(room) {
    const { game } = room;
    if (!game.currentPlayerColor || game.currentPlayerColor === "yellow")
        return false;
    // Check if current player has no legal moves
    if (!(0, gameLogic_1.hasLegalMoves)(game.stacks, game.currentPlayerColor)) {
        // Round ends
        const pinkPlayer = getPlayerByColor(game, "pink");
        const bluePlayer = getPlayerByColor(game, "blue");
        if (!pinkPlayer || !bluePlayer)
            return false;
        // Determine last move player color
        const lastMoveColor = getOtherPlayerColor(game.currentPlayerColor);
        const result = (0, gameLogic_1.determineRoundWinner)(game.stacks, lastMoveColor, pinkPlayer.id, bluePlayer.id);
        game.roundWinner = result.winnerId;
        // Update scores
        if (result.winnerId === pinkPlayer.id) {
            pinkPlayer.score++;
        }
        else if (result.winnerId === bluePlayer.id) {
            bluePlayer.score++;
        }
        // Check for game end (first to 3)
        if (pinkPlayer.score >= 3 || bluePlayer.score >= 3) {
            game.phase = "game_end";
            game.winner = pinkPlayer.score >= 3 ? pinkPlayer.id : bluePlayer.id;
            const winnerColor = pinkPlayer.score >= 3 ? "pink" : "blue";
            room.sockets.forEach((socket) => {
                socket.emit("gameEnd", game.winner, winnerColor);
            });
        }
        else {
            game.phase = "round_end";
        }
        room.sockets.forEach((socket) => {
            socket.emit("roundEnd", result);
        });
        broadcastGameState(room);
        return true;
    }
    return false;
}
function initializeSocketServer(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:3000"],
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        let currentGameCode = null;
        let currentPlayerId = null;
        socket.on("createGame", (playerName, callback) => {
            const code = (0, gameLogic_1.generateGameCode)();
            const playerId = generatePlayerId();
            const playerColor = Math.random() > 0.5 ? "pink" : "blue";
            const player = {
                id: playerId,
                name: playerName,
                color: playerColor,
                score: 0,
            };
            const game = {
                id: generatePlayerId(),
                code,
                players: [player],
                stacks: [],
                currentPlayerId: null,
                currentPlayerColor: null,
                phase: "waiting",
                roundNumber: 1,
                firstPlayerColor: Math.random() > 0.5 ? "pink" : "blue",
                selectedPosition: null,
                winner: null,
                roundWinner: null,
                lastMovePlayerId: null,
            };
            const room = {
                game,
                sockets: new Map(),
            };
            room.sockets.set(playerId, socket);
            games.set(code, room);
            currentGameCode = code;
            currentPlayerId = playerId;
            socket.join(code);
            callback({ success: true, code, playerId });
            socket.emit("gameState", game);
        });
        socket.on("joinGame", (code, playerName, callback) => {
            const lookupCode = code.toUpperCase();
            const room = games.get(lookupCode);
            if (!room) {
                callback({ success: false, error: "Game not found" });
                return;
            }
            if (room.game.players.length >= 2) {
                callback({ success: false, error: "Game is full" });
                return;
            }
            const playerId = generatePlayerId();
            const existingColor = room.game.players[0].color;
            const playerColor = existingColor === "pink" ? "blue" : "pink";
            const player = {
                id: playerId,
                name: playerName,
                color: playerColor,
                score: 0,
            };
            room.game.players.push(player);
            room.sockets.set(playerId, socket);
            currentGameCode = code.toUpperCase();
            currentPlayerId = playerId;
            socket.join(code.toUpperCase());
            callback({ success: true, playerId });
            // Notify existing players
            room.sockets.forEach((s) => {
                if (s !== socket) {
                    s.emit("playerJoined", player);
                }
            });
            // Start the game automatically when 2 players join
            if (room.game.players.length === 2) {
                startGame(room);
                broadcastLegalMoves(room);
            }
            else {
                socket.emit("gameState", room.game);
            }
        });
        socket.on("rejoinGame", (code, playerId, callback) => {
            const lookupCode = code.toUpperCase();
            const room = games.get(lookupCode);
            if (!room) {
                callback({ success: false, error: "Game not found" });
                return;
            }
            // Check if this player is part of this game
            const player = room.game.players.find((p) => p.id === playerId);
            if (!player) {
                callback({ success: false, error: "Player not found in game" });
                return;
            }
            // Re-add socket to room
            room.sockets.set(playerId, socket);
            currentGameCode = lookupCode;
            currentPlayerId = playerId;
            socket.join(lookupCode);
            callback({ success: true });
            // Send current game state
            socket.emit("gameState", room.game);
            // If it's this player's turn, send legal moves
            if (room.game.currentPlayerId === playerId &&
                room.game.phase === "playing") {
                const legalPositions = (0, gameLogic_1.getLegalTilePositions)(room.game.stacks, room.game.currentPlayerColor);
                socket.emit("legalMoves", legalPositions);
            }
        });
        socket.on("selectTile", (position) => {
            if (!currentGameCode || !currentPlayerId)
                return;
            const room = games.get(currentGameCode);
            if (!room)
                return;
            const { game } = room;
            // Only current player can select
            if (game.currentPlayerId !== currentPlayerId)
                return;
            if (game.phase !== "playing")
                return;
            const stack = (0, gameLogic_1.getStackAtPosition)(game.stacks, position);
            if (!stack)
                return;
            const topTile = (0, gameLogic_1.getTopTile)(stack);
            if (!topTile)
                return;
            // Can only select own color or yellow
            if (topTile.color !== game.currentPlayerColor &&
                topTile.color !== "yellow")
                return;
            // Check if this tile has valid moves
            const destinations = (0, gameLogic_1.getValidDestinations)(game.stacks, position);
            if (destinations.length === 0)
                return;
            game.selectedPosition = position;
            broadcastGameState(room);
            // Send legal destinations to current player
            socket.emit("legalDestinations", destinations);
        });
        socket.on("deselectTile", () => {
            if (!currentGameCode || !currentPlayerId)
                return;
            const room = games.get(currentGameCode);
            if (!room)
                return;
            const { game } = room;
            if (game.currentPlayerId !== currentPlayerId)
                return;
            game.selectedPosition = null;
            broadcastGameState(room);
            broadcastLegalMoves(room);
        });
        socket.on("moveTile", (to) => {
            if (!currentGameCode || !currentPlayerId)
                return;
            const room = games.get(currentGameCode);
            if (!room)
                return;
            const { game } = room;
            if (game.currentPlayerId !== currentPlayerId)
                return;
            if (game.phase !== "playing")
                return;
            if (!game.selectedPosition)
                return;
            // Validate move
            const destinations = (0, gameLogic_1.getValidDestinations)(game.stacks, game.selectedPosition);
            const isValidDestination = destinations.some((d) => (0, types_1.positionsEqual)(d, to));
            if (!isValidDestination) {
                socket.emit("error", "Invalid move");
                return;
            }
            // Execute move
            console.log(`Executing move from (${game.selectedPosition.q},${game.selectedPosition.r}) to (${to.q},${to.r})`);
            const stacksBefore = game.stacks
                .map((s) => `(${s.position.q},${s.position.r}):${s.tiles.length}`)
                .join(", ");
            console.log(`Stacks before: ${stacksBefore}`);
            game.stacks = (0, gameLogic_1.executeMove)(game.stacks, {
                from: game.selectedPosition,
                to,
            });
            const stacksAfter = game.stacks
                .map((s) => `(${s.position.q},${s.position.r}):${s.tiles.length}`)
                .join(", ");
            console.log(`Stacks after: ${stacksAfter}`);
            game.selectedPosition = null;
            game.lastMovePlayerId = currentPlayerId;
            // Switch turn
            switchTurn(game);
            console.log(`Turn switched to: ${game.currentPlayerId}, color: ${game.currentPlayerColor}`);
            // Check for round end
            if (!checkRoundEnd(room)) {
                broadcastGameState(room);
                broadcastLegalMoves(room);
            }
        });
        socket.on("nextRound", () => {
            if (!currentGameCode)
                return;
            const room = games.get(currentGameCode);
            if (!room)
                return;
            const { game } = room;
            if (game.phase !== "round_end" && game.phase !== "game_end")
                return;
            if (game.phase === "game_end") {
                // Reset scores and start fresh
                game.players.forEach((p) => (p.score = 0));
                game.roundNumber = 1;
                game.winner = null;
                game.firstPlayerColor = Math.random() > 0.5 ? "pink" : "blue";
                startGame(room);
                broadcastLegalMoves(room);
            }
            else {
                // Next round - loser starts
                const roundWinner = game.players.find((p) => p.id === game.roundWinner);
                const loserColor = roundWinner?.color === "pink" ? "blue" : "pink";
                startNextRound(room, loserColor);
                broadcastLegalMoves(room);
            }
        });
        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
            if (currentGameCode && currentPlayerId) {
                const room = games.get(currentGameCode);
                if (room) {
                    room.sockets.delete(currentPlayerId);
                    // Notify other players
                    room.sockets.forEach((s) => {
                        s.emit("playerLeft", currentPlayerId);
                    });
                    // Don't delete games immediately - give time for reconnection
                    // Delete after 30 seconds if still empty
                    if (room.sockets.size === 0) {
                        const gameCodeToDelete = currentGameCode;
                        console.log(`Game ${gameCodeToDelete} has no connected players, will delete in 30 seconds`);
                        setTimeout(() => {
                            const currentRoom = games.get(gameCodeToDelete);
                            if (currentRoom && currentRoom.sockets.size === 0) {
                                games.delete(gameCodeToDelete);
                                console.log(`Deleted stale game ${gameCodeToDelete}`);
                            }
                        }, 30 * 1000);
                    }
                }
            }
        });
    });
    return io;
}
