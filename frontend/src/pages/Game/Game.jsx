import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { TypographyH1 } from "@/components/ui/typography";
import { usePlayer } from "@/hooks/usePlayer";
import { toastError } from "@/lib/toastApiError";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import clsx from "clsx";
import { Copy, Crown } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { io } from 'socket.io-client';
import { toast } from "sonner";
import Main from "../Main";
import Circle from "./Circle";

const emptyBoard = [
  ["_", "_", "_", "_", "_", "_", "_"],
  ["_", "_", "_", "_", "_", "_", "_"],
  ["_", "_", "_", "_", "_", "_", "_"],
  ["_", "_", "_", "_", "_", "_", "_"],
  ["_", "_", "_", "_", "_", "_", "_"],
  ["_", "_", "_", "_", "_", "_", "_"]
];

const GameContext = createContext();

export default function Game() {
  const { setPlayerSymbol, playerId, playerName, playerSymbol } = usePlayer();
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('room');
  const [board, setBoard] = useState(emptyBoard);
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const [otherPlayerName, setOtherPlayerName] = useState(null)
  const [otherPlayerSymbol, setOtherPlayerSymbol] = useState(null)
  const [isYourTurn, setIsYourTurn] = useState(null)
  const [gameOverState, setGameOverState] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {

    const socket = io('/', {
      transports: ['websocket'],
      withCredentials: false
    });

    socketRef.current = socket

    socket.on('connect', () => {
      toast('Connected to server!')
      socket.emit('join-room', {
        playerId, roomCode, playerName
      })
    })

    socket.on('turn', (data) => {
      const { currentPlayerSymbol } = data
      if (currentPlayerSymbol === playerSymbol) {
        setIsYourTurn(true)
        return
      }
      setIsYourTurn(false)
    })

    socket.on('game-over', (data) => {
      const { winnerSymbol, tied } = data
      if (tied) {
        setGameOverState('tied')
      }

      setGameOverState(`${winnerSymbol} win`)
    })

    socket.on('player-data', (data) => {
      setPlayerSymbol(data.symbol)
    })

    socket.on('player-join', (data) => {
      const { x, o } = data
      if (x && x.playerId !== playerId) {
        setOtherPlayerName(x.playerName)
        setOtherPlayerSymbol(x.playerSymbol)
      }
      if (o && o.playerId !== playerId) {
        setOtherPlayerName(o.playerName)
        setOtherPlayerSymbol(o.playerSymbol)
      }
    })

    socket.on('disconnect', () => {
      toastError(['Disconnected from server!'])
    })

    socket.on('board-update', (data) => {
      const newBoardState = data.board
      if (data.move) {
        const { coords: { cellIndex: x, rowIndex: y }, symbol } = data.move
        // Handle new move animation
      }

      setBoard(newBoardState)
    })

    socket.on('error', ({ data }) => {
      toastError(data.messages)
    })

    return () => {
      socketRef.current = null
      socket.disconnect()
    }
  }, [roomCode, playerId, playerName, playerSymbol])

  function handleCellClick(rowIndex, cellIndex) {
    if (!isYourTurn) return
    if (gameOverState) return
    const socket = socketRef.current
    socket.emit('make-move', { roomCode, cellIndex, playerId })
  }

  return (
    <GameContext.Provider value={{ gameOverState, isYourTurn, board, hoveredColumn, setHoveredColumn, handleCellClick, otherPlayerName, setOtherPlayerName, otherPlayerSymbol, setOtherPlayerSymbol }}>
      <Main>
        <div className="flex flex-col justify-center gap-2">
          <GameInfo />
          <Board />
          {
            gameOverState &&
            <WinnerDisplay />
          }
          <div className="absolute right-5 bottom-5">
            <ThemeToggle />
          </div>
        </div>
      </Main>
    </GameContext.Provider>
  );
}

function WinnerDisplay() {
  const { gameOverState, otherPlayerName, otherPlayerSymbol } = useContext(GameContext)
  const { playerSymbol, playerName } = usePlayer()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(true)
  }, [])

  const isPlayerWinner = gameOverState === `${playerSymbol} win`
  const winningPlayerName = isPlayerWinner ? playerName : otherPlayerName
  const winningSymbol = isPlayerWinner ? playerSymbol : otherPlayerSymbol

  let displayMessage = 'Game Over'
  displayMessage = (<span> <PlayerName name={winningPlayerName} symbol={winningSymbol} /> wins! </span>)
  if (gameOverState === 'tied') displayMessage = "It's a tie!"

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger className="text-xl hover:cursor-pointer">
        {displayMessage}
      </DrawerTrigger>
      <DrawerContent className="flex size-full flex-col items-center">
        <VisuallyHidden>
          <DrawerTitle>
            <PlayerName name={winningPlayerName} symbol={winningSymbol} /> wins!
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </VisuallyHidden>
        <div className="flex size-full flex-col items-center justify-center text-center">
          <Crown className="size-20 animate-bounce md:size-36" />
          <span className="animate-bounce text-5xl font-black md:text-9xl"><PlayerName name={winningPlayerName} symbol={winningSymbol} /> wins!</span>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button className="size-full" variant="outline">Got it</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function PlayerName({ name, symbol }) {
  const { isYourTurn } = useContext(GameContext);
  const { playerSymbol } = usePlayer();

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
  );
}

function GameInfo() {
  const { playerSymbol, playerName } = usePlayer();
  const { otherPlayerName, otherPlayerSymbol } = useContext(GameContext)
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('room');

  function copyCode() {
    if (!roomCode) {
      toastError(['Room code is unavailable']);
      return;
    }

    if (!navigator.clipboard) {
      toastError(['Clipboard access denied by browser']);
      return;
    }

    try {
      navigator.clipboard.writeText(roomCode);
      toast('Room code copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toastError(['Failed to copy room code']);
    }
  }
  return (
    <div className="flex w-full flex-col gap-4 text-center">
      <div className="flex flex-col gap-2" onClick={copyCode} >
        <TypographyH1>Connect Four</TypographyH1>
        <div className="flex justify-center gap-1 text-muted-foreground hover:cursor-pointer">
          <Copy /><kbd> {roomCode} </kbd>
        </div>
      </div>
      <div className="flex justify-around gap-4 sm:justify-between">
        <PlayerName name={playerName} symbol={playerSymbol} />
        <PlayerName name={otherPlayerName} symbol={otherPlayerSymbol} />
      </div>
    </div>
  );
}

function Board() {
  const { board } = useContext(GameContext);

  return (
    <div className="flex w-[100vw] flex-col flex-nowrap rounded-lg bg-blue-500 p-2 sm:w-full">
      {board.map((row, rowIndex) => (
        <BoardRow key={rowIndex} row={row} rowIndex={rowIndex} />
      ))}
    </div>
  );
}

function BoardRow({ row, rowIndex }) {
  return (
    <div className="flex">
      {row.map((cell, cellIndex) => (
        <BoardCell key={cellIndex} cellValue={cell} rowIndex={rowIndex} cellIndex={cellIndex} />
      ))}
    </div>
  );
}

function BoardCell({ cellValue, rowIndex, cellIndex }) {
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
