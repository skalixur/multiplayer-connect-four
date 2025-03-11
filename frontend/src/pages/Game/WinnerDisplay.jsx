import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer"
import { usePlayer } from "@/hooks/usePlayer"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Crown } from "lucide-react"
import { useContext, useState, useEffect } from "react"
import { GameContext } from "./GameContext"
import { PlayerName } from "./PlayerName"

export function WinnerDisplay() {
  const { gameOverState, otherPlayerName, otherPlayerSymbol } =
    useContext(GameContext)
  const { playerSymbol, playerName } = usePlayer()
  const [open, setOpen] = useState(true)

  useEffect(() => {
    setOpen(true)
  }, [])

  const isPlayerWinner = gameOverState === `${playerSymbol} win`
  const winningPlayer = isPlayerWinner
    ? { name: playerName, symbol: playerSymbol }
    : { name: otherPlayerName, symbol: otherPlayerSymbol }

  const { name: winningPlayerName, symbol: winningSymbol } = winningPlayer

  const displayMessage =
    gameOverState === "tied" ? (
      "It's a tie!"
    ) : (
      <span>
        <PlayerName {...winningPlayer} /> wins!
      </span>
    )

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full flex">
          {displayMessage}
        </Button>
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
          <span className="animate-bounce text-5xl font-black md:text-9xl">
            <PlayerName name={winningPlayerName} symbol={winningSymbol} /> wins!
          </span>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button className="size-full" variant="outline">
              Got it
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
