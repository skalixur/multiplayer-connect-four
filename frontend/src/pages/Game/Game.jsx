import { ThemeToggle } from "@/components/theme-toggle";
import { usePlayer } from "@/hooks/usePlayer";
import { toastError } from "@/lib/toastApiError";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { io } from 'socket.io-client';
import { toast } from "sonner";
import Main from "../Main";
import { Board } from "./Board";
import { GameContext } from "./GameContext";
import { GameControls } from "./GameControls";
import { GameInfo } from "./GameInfo";
import { WinnerDisplay } from "./WinnerDisplay";

const emptyBoard = Array(6).fill(Array(7).fill("_"));

export default function Game() {
  const { setPlayerSymbol, playerId, playerName, playerSymbol, clearPlayerData } = usePlayer();
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
    const socket = io(import.meta.env.VITE_API_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      toast("Connected to room!");
      socket.emit("join-room", { playerId, roomCode, playerName });
    });

    socket.on("turn", ({ currentPlayerSymbol }) => setIsYourTurn(currentPlayerSymbol === playerSymbol));
    socket.on("game-over", ({ winnerSymbol, tied }) => setGameOverState(tied ? "tied" : `${winnerSymbol} win`));
    socket.on("player-data", ({ symbol }) => setPlayerSymbol(symbol));
    socket.on("player-join", (data) => {
      const opponent = data.x?.playerId !== playerId ? data.x : data.o?.playerId !== playerId ? data.o : null;
      if (opponent) {
        setOtherPlayerName(opponent.playerName)
        setOtherPlayerSymbol(opponent.playerSymbol)
      }
    });
    socket.on("disconnect", () => toastError(["Disconnected from the room!"]));
    socket.on("board-update", ({ board }) => setBoard(board));
    socket.on("error", ({ data }) => {
      toastError(data.messages);
      if (data.redirectToHome) navigate("/");
    });

    return () => {
      socketRef.current = null;
      socket.disconnect();
    };
  }, [roomCode, playerId, playerName, playerSymbol]);

  function onLeaveRoomClick() {
    clearPlayerData()
    emitEvent('room-leave')
  }

  function onRematchClick(isRematchRequested) {
    emitEvent(isRematchRequested ? 'rematch' : 'rematch-cancel')
    toast(isRematchRequested ? 'Rematch request sent!' : 'Rematch request cancelled!')
  }

  const emitEvent = (event, payload) => socketRef.current?.emit(event, { roomCode, playerId, ...payload });
  const handleCellClick = (rowIndex, cellIndex) => isYourTurn && !gameOverState && emitEvent("make-move", { cellIndex });

  return (
    <GameContext.Provider value={{ gameOverState, isYourTurn, board, hoveredColumn, setHoveredColumn, handleCellClick, otherPlayerName, setOtherPlayerName, otherPlayerSymbol, setOtherPlayerSymbol }}>
      <Main>
        <div className="flex flex-col justify-center gap-2">
          <GameInfo />
          <Board />
          <div className="flex w-full justify-center items-center flex-col gap-2">
            {
              gameOverState && <WinnerDisplay />
            }
            <GameControls onRematchClick={onRematchClick} onLeaveRoomClick={onLeaveRoomClick} />
          </div>
          <div className="absolute right-5 bottom-5">
            <ThemeToggle />
          </div>
        </div>
      </Main>
    </GameContext.Provider>
  );
}
