import { Player } from "@shared/types";
import "./ScoreBoard.css";

interface ScoreBoardProps {
  players: Player[];
  currentPlayerId: string;
}

function ScoreBoard({ players, currentPlayerId }: ScoreBoardProps) {
  const me = players.find((p) => p.id === currentPlayerId);
  const opponent = players.find((p) => p.id !== currentPlayerId);

  return (
    <div className="scoreboard">
      {me && <PlayerScore player={me} label="You" isMe={true} />}

      <div className="scoreboard-divider">
        <span className="scoreboard-vs">VS</span>
      </div>

      {opponent && (
        <PlayerScore player={opponent} label={opponent.name} isMe={false} />
      )}
    </div>
  );
}

interface PlayerScoreProps {
  player: Player;
  label: string;
  isMe: boolean;
}

function PlayerScore({ player, label, isMe }: PlayerScoreProps) {
  const colorClass = `player-score-${player.color}`;

  return (
    <div className={`player-score ${colorClass} ${isMe ? "is-me" : ""}`}>
      <div className="player-score-header">
        <span className="player-score-name">{label}</span>
        <span className={`player-score-color-badge ${player.color}`}>
          {player.color}
        </span>
      </div>
      <div className="player-score-rounds">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`round-marker ${i < player.score ? "filled" : ""} ${
              player.color
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default ScoreBoard;
