import "./Divider.css";

interface DividerProps {
  text?: string;
}

function Divider({ text }: DividerProps) {
  if (text) {
    return (
      <div className="divider-with-text">
        <span className="divider-line" />
        <span className="divider-text">{text}</span>
        <span className="divider-line" />
      </div>
    );
  }

  return <hr className="divider" />;
}

export default Divider;
