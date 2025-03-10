import { Button } from "@/components/ui/button"
import { Ellipsis, RotateCcw, DoorOpen } from "lucide-react"
import { useContext, useState } from "react"
import { useNavigate } from "react-router"
import { GameContext } from "./GameContext"

export function GameControls({ onRematchClick, onLeaveRoomClick }) {
  const { gameOverState } = useContext(GameContext)
  const [isRematchRequested, setIsRematchRequested] = useState(false)
  const navigate = useNavigate()

  function onRematchClickHandler() {
    const newRematchState = !isRematchRequested
    setIsRematchRequested(newRematchState)
    onRematchClick(newRematchState, setIsRematchRequested)
  }

  function onLeaveRoomClickHandler() {
    navigate('/')
    onLeaveRoomClick()
  }

  return (
    <div className="flex gap-4 w-[50%] items-center justify-center">
      {gameOverState &&
        <Button onClick={onRematchClickHandler}>
          {isRematchRequested ? <Ellipsis className="animate-pulse" /> : <RotateCcw />}
          {isRematchRequested ? "Cancel rematch" : "Rematch"}
        </Button>
      }
      <Button onClick={onLeaveRoomClickHandler} variant="outline"><DoorOpen />Leave Room</Button>
    </div>
  );
}
