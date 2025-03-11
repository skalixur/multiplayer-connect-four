import { usePlayer } from "@/hooks/usePlayer"
import clsx from "clsx"
import { useContext } from "react"
import { GameContext } from "./GameContext"

export function PlayerName({ name, symbol }) {
  const { isYourTurn } = useContext(GameContext)
  const { playerSymbol } = usePlayer()

  return (
    <span
      className={clsx(
        "font-bold transition-opacity font",
        symbol === "x" && "text-red-500",
        symbol === "o" && "text-yellow-500",
        !isYourTurn && symbol === playerSymbol && "opacity-50",
        isYourTurn && symbol !== playerSymbol && "opacity-50",
      )}
    >
      {name}
    </span>
  )
}
