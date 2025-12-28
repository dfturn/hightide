import { Routes, Route } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import LobbyPage from "./pages/LobbyPage";
import GamePage from "./pages/GamePage";
import DevGamePage from "./pages/DevGamePage";

function App() {
  return (
    <GameProvider>
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/game/:code" element={<GamePage />} />
        <Route path="/dev" element={<DevGamePage />} />
      </Routes>
    </GameProvider>
  );
}

export default App;
