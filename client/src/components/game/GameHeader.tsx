import "./GameHeader.css";

interface GameHeaderProps {
  gameCode: string;
  showResignButton?: boolean;
  onResign?: () => void;
}

function GameHeader({ gameCode, showResignButton, onResign }: GameHeaderProps) {
  return (
    <header className="game-header">
      <h1 className="game-header-title">High Tide</h1>
      <div className="game-header-right">
        <div className="game-header-code">
          <span className="game-header-code-label">Room:</span>
          <span className="game-header-code-value">{gameCode}</span>
        </div>
        {showResignButton && onResign && (
          <button className="game-header-resign-button" onClick={onResign}>
            Resign
          </button>
        )}
      </div>
    </header>
  );
}

export default GameHeader;
