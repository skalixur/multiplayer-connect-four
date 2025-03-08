import { TypographyH3 } from "@/components/ui/typography";
import GameStartControl from "./GameStartControl";
import { Button } from "@/components/ui/button";

export default ({ onRoomCreateClick }) => (
    <GameStartControl label={<TypographyH3>Create a game</TypographyH3>}>
        <Button onClick={onRoomCreateClick} className="w-full">Create</Button>
    </GameStartControl>
);
