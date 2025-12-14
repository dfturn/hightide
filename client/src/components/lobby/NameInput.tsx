import "./NameInput.css";

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function NameInput({ value, onChange, disabled }: NameInputProps) {
  return (
    <div className="name-input-container">
      <label htmlFor="player-name" className="name-input-label">
        Your Name
      </label>
      <input
        id="player-name"
        type="text"
        className="name-input"
        placeholder="Enter your name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={20}
        autoComplete="off"
      />
    </div>
  );
}

export default NameInput;
