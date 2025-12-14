"use strict";
// Shared types for High Tide game
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEX_DIRECTIONS = void 0;
exports.positionKey = positionKey;
exports.parsePositionKey = parsePositionKey;
exports.positionsEqual = positionsEqual;
exports.getNeighborPosition = getNeighborPosition;
exports.getNeighborPositions = getNeighborPositions;
// Utility functions for hex coordinates
function positionKey(pos) {
    return `${pos.q},${pos.r}`;
}
function parsePositionKey(key) {
    const [q, r] = key.split(",").map(Number);
    return { q, r };
}
function positionsEqual(a, b) {
    return a.q === b.q && a.r === b.r;
}
// Axial coordinate directions for hex grid (pointy-top)
exports.HEX_DIRECTIONS = [
    { q: 1, r: 0 }, // East
    { q: 1, r: -1 }, // Northeast
    { q: 0, r: -1 }, // Northwest
    { q: -1, r: 0 }, // West
    { q: -1, r: 1 }, // Southwest
    { q: 0, r: 1 }, // Southeast
];
function getNeighborPosition(pos, direction) {
    return { q: pos.q + direction.q, r: pos.r + direction.r };
}
function getNeighborPositions(pos) {
    return exports.HEX_DIRECTIONS.map((dir) => getNeighborPosition(pos, dir));
}
