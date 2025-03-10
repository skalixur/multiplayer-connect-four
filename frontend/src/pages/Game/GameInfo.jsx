import { TypographyH1 } from "@/components/ui/typography";
import { usePlayer } from "@/hooks/usePlayer";
import { toastError } from "@/lib/toastApiError";
import { Copy } from "lucide-react";
import { useContext } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import { GameContext } from "./GameContext";
import { PlayerName } from "./PlayerName";

export function GameInfo() {
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
