import { TypographyH3 } from "@/components/ui/typography";
import GameStartControl from "./GameStartControl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default ({ code, onCodeChange, onRoomJoinClick }) => (
  <GameStartControl label={<TypographyH3>Join a room</TypographyH3>}>
    <div className="flex gap-2 flex-nowrap">
      <Button onClick={onRoomJoinClick}>Join</Button>
      <Input
        autoComplete="off"
        type="text"
        value={code}
        onChange={onCodeChange}
        onKeyDown={(event) => event.key === "Enter" && onRoomJoinClick(event)}
        placeholder="Enter the code"
        maxLength={4} />
    </div>
  </GameStartControl>
);
