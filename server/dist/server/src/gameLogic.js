"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGameCode = generateGameCode;
exports.createInitialBoard = createInitialBoard;
exports.getStackAtPosition = getStackAtPosition;
exports.getTopTile = getTopTile;
exports.countFreeAdjacentSides = countFreeAdjacentSides;
exports.wouldRemainConnected = wouldRemainConnected;
exports.getValidDestinations = getValidDestinations;
exports.getLegalMoves = getLegalMoves;
exports.getLegalTilePositions = getLegalTilePositions;
exports.executeMove = executeMove;
exports.countVisibleTiles = countVisibleTiles;
exports.getHighestStackForColor = getHighestStackForColor;
exports.determineRoundWinner = determineRoundWinner;
exports.hasLegalMoves = hasLegalMoves;
const types_1 = require("../../shared/types");
// Generate a unique ID
function generateId() {
    return Math.random().toString(36).substring(2, 15);
}
// Generate a 6-character game code
function generateGameCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded confusing chars
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
// Shuffle array in place
function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
// Get all hex positions in a hexagonal grid with radius 2 (19 tiles)
function getHexGridPositions() {
    const positions = [];
    const radius = 2;
    for (let q = -radius; q <= radius; q++) {
        const r1 = Math.max(-radius, -q - radius);
        const r2 = Math.min(radius, -q + radius);
        for (let r = r1; r <= r2; r++) {
            positions.push({ q, r });
        }
    }
    return positions;
}
// Create initial board setup
function createInitialBoard() {
    const positions = getHexGridPositions();
    // Create tiles: 7 pink, 7 blue, 5 yellow
    const tiles = [];
    for (let i = 0; i < 7; i++) {
        tiles.push({ id: generateId(), color: "pink" });
        tiles.push({ id: generateId(), color: "blue" });
    }
    for (let i = 0; i < 5; i++) {
        tiles.push({ id: generateId(), color: "yellow" });
    }
    // Find center position and its neighbors
    const centerPos = positions.find((p) => p.q === 0 && p.r === 0);
    const neighborPositions = (0, types_1.getNeighborPositions)(centerPos);
    const outerPositions = positions.filter((p) => !(0, types_1.positionsEqual)(p, centerPos) &&
        !neighborPositions.some((n) => (0, types_1.positionsEqual)(n, p)));
    // Separate tiles by color
    const pinkTiles = tiles.filter((t) => t.color === "pink");
    const blueTiles = tiles.filter((t) => t.color === "blue");
    const yellowTiles = tiles.filter((t) => t.color === "yellow");
    // Reserve 1 yellow for center, 2 of each color for the 6 neighbors
    const centerTile = yellowTiles.pop();
    const neighborTiles = [
        pinkTiles.pop(),
        pinkTiles.pop(),
        blueTiles.pop(),
        blueTiles.pop(),
        yellowTiles.pop(),
        yellowTiles.pop(),
    ];
    const shuffledNeighborTiles = shuffle(neighborTiles);
    // Remaining tiles go to outer positions
    const remainingTiles = [...pinkTiles, ...blueTiles, ...yellowTiles];
    const shuffledRemainingTiles = shuffle(remainingTiles);
    const shuffledOuterPositions = shuffle(outerPositions);
    // Create stacks
    const stacks = [];
    // Center stack with yellow tile
    stacks.push({
        position: centerPos,
        tiles: [centerTile],
    });
    // Neighbor stacks with 2 pink, 2 blue, 2 yellow (shuffled)
    for (let i = 0; i < neighborPositions.length; i++) {
        stacks.push({
            position: neighborPositions[i],
            tiles: [shuffledNeighborTiles[i]],
        });
    }
    // Outer stacks with remaining tiles
    for (let i = 0; i < shuffledRemainingTiles.length; i++) {
        stacks.push({
            position: shuffledOuterPositions[i],
            tiles: [shuffledRemainingTiles[i]],
        });
    }
    return stacks;
}
// Get stack at position
function getStackAtPosition(stacks, pos) {
    return stacks.find((s) => (0, types_1.positionsEqual)(s.position, pos));
}
// Get top tile of a stack
function getTopTile(stack) {
    return stack.tiles[stack.tiles.length - 1];
}
// Count free adjacent sides for a stack
function countFreeAdjacentSides(stacks, pos) {
    const neighbors = (0, types_1.getNeighborPositions)(pos);
    let freeCount = 0;
    for (const neighbor of neighbors) {
        const neighborStack = getStackAtPosition(stacks, neighbor);
        if (!neighborStack || neighborStack.tiles.length === 0) {
            freeCount++;
        }
    }
    return freeCount;
}
// Check whether all occupied stacks belong to a single connected component
function areStacksConnected(stacks) {
    const occupiedStacks = stacks.filter((stack) => stack.tiles.length > 0);
    if (occupiedStacks.length <= 1)
        return true;
    const visited = new Set();
    const queue = [];
    queue.push(occupiedStacks[0].position);
    visited.add((0, types_1.positionKey)(occupiedStacks[0].position));
    while (queue.length > 0) {
        const current = queue.shift();
        for (const neighbor of (0, types_1.getNeighborPositions)(current)) {
            const neighborStack = getStackAtPosition(stacks, neighbor);
            if (neighborStack && neighborStack.tiles.length > 0) {
                const neighborKey = (0, types_1.positionKey)(neighbor);
                if (!visited.has(neighborKey)) {
                    visited.add(neighborKey);
                    queue.push(neighbor);
                }
            }
        }
    }
    return visited.size === occupiedStacks.length;
}
// Check if all stacks remain connected after removing a tile from a position
function wouldRemainConnected(stacks, fromPos) {
    const fromStack = getStackAtPosition(stacks, fromPos);
    if (!fromStack || fromStack.tiles.length === 0)
        return true;
    const simulatedStacks = stacks.map((stack) => ({
        ...stack,
        tiles: [...stack.tiles],
    }));
    const simulatedFromStack = getStackAtPosition(simulatedStacks, fromPos);
    if (!simulatedFromStack)
        return true;
    simulatedFromStack.tiles.pop();
    return areStacksConnected(simulatedStacks);
}
function wouldMoveKeepBoardConnected(stacks, move) {
    const simulatedStacks = executeMove(stacks, move);
    return areStacksConnected(simulatedStacks);
}
// Get valid moves for a tile at a position
function getValidDestinations(stacks, fromPos) {
    const fromStack = getStackAtPosition(stacks, fromPos);
    if (!fromStack || fromStack.tiles.length === 0)
        return [];
    const fromHeight = fromStack.tiles.length;
    // Check if tile has at least 2 free adjacent sides
    if (countFreeAdjacentSides(stacks, fromPos) < 2)
        return [];
    // Check if moving would keep all tiles connected
    if (!wouldRemainConnected(stacks, fromPos))
        return [];
    const validDestinations = [];
    for (const neighbor of (0, types_1.getNeighborPositions)(fromPos)) {
        const neighborStack = getStackAtPosition(stacks, neighbor);
        // Must move to an existing stack (adjacent occupied position)
        if (!neighborStack || neighborStack.tiles.length === 0)
            continue;
        const destinationHeightAfterMove = neighborStack.tiles.length + 1;
        if (destinationHeightAfterMove <= fromHeight)
            continue;
        const simulatedMove = { from: fromPos, to: neighbor };
        if (!wouldMoveKeepBoardConnected(stacks, simulatedMove))
            continue;
        validDestinations.push(neighbor);
    }
    return validDestinations;
}
// Get all legal moves for a player
function getLegalMoves(stacks, playerColor) {
    const moves = [];
    for (const stack of stacks) {
        if (stack.tiles.length === 0)
            continue;
        const topTile = getTopTile(stack);
        if (!topTile)
            continue;
        // Player can move their own tiles or yellow tiles
        if (topTile.color !== playerColor && topTile.color !== "yellow")
            continue;
        const destinations = getValidDestinations(stacks, stack.position);
        for (const dest of destinations) {
            moves.push({ from: stack.position, to: dest });
        }
    }
    return moves;
}
// Get positions of tiles a player can legally move
function getLegalTilePositions(stacks, playerColor) {
    const positions = [];
    for (const stack of stacks) {
        if (stack.tiles.length === 0)
            continue;
        const topTile = getTopTile(stack);
        if (!topTile)
            continue;
        // Player can move their own tiles or yellow tiles
        if (topTile.color !== playerColor && topTile.color !== "yellow")
            continue;
        // Check if this tile has any valid moves
        const destinations = getValidDestinations(stacks, stack.position);
        if (destinations.length > 0) {
            positions.push(stack.position);
        }
    }
    return positions;
}
// Execute a move
function executeMove(stacks, move) {
    const newStacks = stacks.map((s) => ({
        ...s,
        tiles: [...s.tiles],
    }));
    const fromStack = getStackAtPosition(newStacks, move.from);
    const toStack = getStackAtPosition(newStacks, move.to);
    if (!fromStack || !toStack)
        return newStacks;
    // Remove top tile from source
    const tile = fromStack.tiles.pop();
    if (!tile)
        return newStacks;
    // Add to destination
    toStack.tiles.push(tile);
    return newStacks;
}
// Count visible tiles of each color
function countVisibleTiles(stacks) {
    const counts = { pink: 0, blue: 0, yellow: 0 };
    for (const stack of stacks) {
        const topTile = getTopTile(stack);
        if (topTile) {
            counts[topTile.color]++;
        }
    }
    return counts;
}
// Get the highest stack for a color
function getHighestStackForColor(stacks, color) {
    let maxHeight = 0;
    for (const stack of stacks) {
        const topTile = getTopTile(stack);
        if (topTile && topTile.color === color) {
            maxHeight = Math.max(maxHeight, stack.tiles.length);
        }
    }
    return maxHeight;
}
// Determine round winner
function determineRoundWinner(stacks, lastMovePlayerColor, pinkPlayerId, bluePlayerId) {
    const visible = countVisibleTiles(stacks);
    let winnerId = null;
    let winnerColor = null;
    let tiebreaker = null;
    if (visible.pink > visible.blue) {
        winnerId = pinkPlayerId;
        winnerColor = "pink";
        tiebreaker = "visible";
    }
    else if (visible.blue > visible.pink) {
        winnerId = bluePlayerId;
        winnerColor = "blue";
        tiebreaker = "visible";
    }
    else {
        // Tiebreaker 1: Highest stack
        const pinkHighest = getHighestStackForColor(stacks, "pink");
        const blueHighest = getHighestStackForColor(stacks, "blue");
        if (pinkHighest > blueHighest) {
            winnerId = pinkPlayerId;
            winnerColor = "pink";
            tiebreaker = "highest_stack";
        }
        else if (blueHighest > pinkHighest) {
            winnerId = bluePlayerId;
            winnerColor = "blue";
            tiebreaker = "highest_stack";
        }
        else {
            // Tiebreaker 2: Last move
            if (lastMovePlayerColor === "pink") {
                winnerId = pinkPlayerId;
                winnerColor = "pink";
            }
            else {
                winnerId = bluePlayerId;
                winnerColor = "blue";
            }
            tiebreaker = "last_move";
        }
    }
    return {
        pinkVisible: visible.pink,
        blueVisible: visible.blue,
        winnerId,
        winnerColor,
        tiebreaker,
    };
}
// Check if a player has any legal moves
function hasLegalMoves(stacks, playerColor) {
    return getLegalMoves(stacks, playerColor).length > 0;
}
