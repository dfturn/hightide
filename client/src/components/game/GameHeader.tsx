import "./GameHeader.css";

interface GameHeaderProps {
  gameCode: string;
}

function GameHeader({ gameCode }: GameHeaderProps) {
  return (
    <header className="game-header">
      <h1 className="game-header-title">High Tide</h1>
      <div className="game-header-code">
        <span className="game-header-code-label">Room:</span>
        <span className="game-header-code-value">{gameCode}</span>
      </div>
    </header>
  );
}

export default GameHeader;
