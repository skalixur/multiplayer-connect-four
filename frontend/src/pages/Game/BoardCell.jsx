import { usePlayer } from "@/hooks/usePlayer";
import clsx from "clsx";
import { useContext } from "react";
import Circle from "./Circle";
import { GameContext } from "./GameContext";

export function BoardCell({ cellValue, rowIndex, cellIndex }) {
  const { playerSymbol } = usePlayer();
  const { hoveredColumn, setHoveredColumn, handleCellClick, gameOverState } = useContext(GameContext);

  const isHovered = hoveredColumn === cellIndex;
  const isEmpty = cellValue === "_";
  const isClickable = !gameOverState && isEmpty;

  const getCircleColor = () => {
    if (!isEmpty) return cellValue === "x" ? "fill-red-500" : "fill-yellow-500";
    if (!playerSymbol) return isHovered ? "fill-muted" : "fill-background";
    return isHovered
      ? playerSymbol === "x"
        ? "fill-red-950"
        : "fill-yellow-950"
      : "fill-background";
  };

  return (
    <div
      onClick={() => isClickable && handleCellClick(rowIndex, cellIndex)}
      data-row-index={rowIndex}
      data-cell-index={cellIndex}
      className={clsx(
        "size-full sm:size-[10vmin] grid place-items-center transition-colors",
        isClickable ? "cursor-pointer" : "cursor-default"
      )}
      onMouseEnter={() => isClickable && setHoveredColumn(cellIndex)}
      onMouseLeave={() => setHoveredColumn(null)}
    >
      <Circle className={getCircleColor()} />
    </div>
  );
}

