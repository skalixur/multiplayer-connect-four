import { PlayerContext } from "./PlayerContext";
import { useStateWithLocalStorage } from "@/hooks/useStateWithLocalStorage";

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [playerName, setPlayerName] = useStateWithLocalStorage<string>("playerName", "")
  const [playerId, setPlayerId] = useStateWithLocalStorage<string>("playerId", "");
  const [playerSymbol, setPlayerSymbol] = useStateWithLocalStorage<string>("playerSymbol", "");

  return (
    <PlayerContext.Provider value={{ playerName, setPlayerName, playerId, setPlayerId, playerSymbol, setPlayerSymbol }}>
      {children}
    </PlayerContext.Provider>
  );
}

