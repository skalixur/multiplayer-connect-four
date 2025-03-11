import { useContext } from "react"
import { BoardRow } from "./BoardRow"
import { GameContext } from "./GameContext"

export function Board() {
  const { board } = useContext(GameContext)

  return (
    <div className="flex w-[100vw] flex-col flex-nowrap rounded-lg bg-blue-500 p-2 sm:w-full">
      {board.map((row, rowIndex) => (
        <BoardRow key={rowIndex} row={row} rowIndex={rowIndex} />
      ))}
    </div>
  )
}
