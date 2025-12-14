import { ChangeEvent } from "react";
import "./JoinGameForm.css";

interface JoinGameFormProps {
  code: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  loading?: boolean;
}

function JoinGameForm({
  code,
  onCodeChange,
  onSubmit,
  disabled,
  loading,
}: JoinGameFormProps) {
  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (value.length <= 6) {
      onCodeChange(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled && !loading) {
      onSubmit();
    }
  };

  return (
    <form className="join-game-form" onSubmit={handleSubmit}>
      <div className="join-game-input-container">
        <label htmlFor="game-code" className="join-game-label">
          Game Code
        </label>
        <input
          id="game-code"
          type="text"
          className="join-game-input"
          placeholder="ABCD12"
          value={code}
          onChange={handleCodeChange}
          disabled={loading}
          maxLength={6}
          autoComplete="off"
          autoCapitalize="characters"
        />
      </div>
      <button
        type="submit"
        className="join-game-button"
        disabled={disabled || loading}
      >
        {loading ? (
          <span className="button-loading">
            <span className="spinner" />
            Joining...
          </span>
        ) : (
          "Join Game"
        )}
      </button>
    </form>
  );
}

export default JoinGameForm;
