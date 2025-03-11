import { BoardCell } from "./BoardCell"

export function BoardRow({ row, rowIndex }) {
  return (
    <div className="flex">
      {row.map((cell, cellIndex) => (
        <BoardCell
          key={cellIndex}
          cellValue={cell}
          rowIndex={rowIndex}
          cellIndex={cellIndex}
        />
      ))}
    </div>
  )
}
