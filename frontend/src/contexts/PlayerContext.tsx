import { createContext } from "react"

interface PlayerContextType {
  playerName: string
  setPlayerName: (name: string) => void
  playerId: string
  setPlayerId: (id: string) => void
  playerSymbol: string
  setPlayerSymbol: (symbol: string) => void
  clearPlayerData: () => void
}

export const PlayerContext = createContext<PlayerContextType | null>(null)
