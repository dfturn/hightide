import { ReactNode } from "react";
import "./GameLayout.css";

interface GameLayoutProps {
  children: ReactNode;
}

function GameLayout({ children }: GameLayoutProps) {
  return <div className="game-layout">{children}</div>;
}

export default GameLayout;
