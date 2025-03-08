import { PlayerContext } from "@/contexts/PlayerContext"
import { useContext } from "react"

export function usePlayer() {
  return useContext(PlayerContext)
}
