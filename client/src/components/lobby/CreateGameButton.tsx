import "./CreateGameButton.css";

interface CreateGameButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

function CreateGameButton({
  onClick,
  disabled,
  loading,
}: CreateGameButtonProps) {
  return (
    <button
      className="create-game-button"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="button-loading">
          <span className="spinner" />
          Creating...
        </span>
      ) : (
        "Create New Game"
      )}
    </button>
  );
}

export default CreateGameButton;
