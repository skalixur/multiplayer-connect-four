import { useStateWithLocalStorage } from "@/hooks/useStateWithLocalStorage";
import { PlayerContext } from "./PlayerContext";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [playerName, setPlayerName] = useStateWithLocalStorage<string>("playerName", "")
  const [playerId, setPlayerId] = useStateWithLocalStorage<string>("playerId", "");
  const [playerSymbol, setPlayerSymbol] = useStateWithLocalStorage<string>("playerSymbol", "");

  function clearPlayerData() {
    setPlayerName("");
    setPlayerId("");
    setPlayerSymbol("");
  }

  return (
    <PlayerContext.Provider value={{ playerName, setPlayerName, playerId, setPlayerId, playerSymbol, setPlayerSymbol, clearPlayerData }}>
      {children}
    </PlayerContext.Provider>
  );
}

