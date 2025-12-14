import { ReactNode } from "react";
import "./LobbyLayout.css";

interface LobbyLayoutProps {
  children: ReactNode;
}

function LobbyLayout({ children }: LobbyLayoutProps) {
  return (
    <div className="lobby-layout">
      <div className="lobby-container">{children}</div>
    </div>
  );
}

export default LobbyLayout;
