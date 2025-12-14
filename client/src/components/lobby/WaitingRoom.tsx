import "./WaitingRoom.css";

interface WaitingRoomProps {
  gameCode: string;
  onCancel: () => void;
}

function WaitingRoom({ gameCode, onCancel }: WaitingRoomProps) {
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(gameCode);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div className="waiting-room">
      <div className="waiting-room-container">
        <h2 className="waiting-room-title">Waiting for Player</h2>

        <div className="waiting-room-code-section">
          <p className="waiting-room-label">Share this code:</p>
          <div className="waiting-room-code-display">
            <span className="waiting-room-code">{gameCode}</span>
            <button
              className="copy-code-button"
              onClick={handleCopyCode}
              aria-label="Copy code"
            >
              <CopyIcon />
            </button>
          </div>
        </div>

        <div className="waiting-room-animation">
          <span className="waiting-dot"></span>
          <span className="waiting-dot"></span>
          <span className="waiting-dot"></span>
        </div>

        <p className="waiting-room-hint">
          The game will start automatically when another player joins
        </p>

        <button className="waiting-room-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  );
}

export default WaitingRoom;
