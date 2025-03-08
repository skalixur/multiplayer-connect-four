import WarningAlert from "@/components/WarningAlert"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { TypographyH1 } from "@/components/ui/typography"
import { usePlayer } from "@/hooks/usePlayer"
import toastApiError from "@/lib/toastApiError"
import withErrorHandling from "@/lib/withErrorHandling"
import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import GameStartControl from "./GameStartControl"
import Main from "../Main"
import RoomCreate from "./RoomCreate"
import RoomJoin from "./RoomJoin"
import { API } from "@/lib/api"

export default function Home() {
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const navigate = useNavigate()
  const { setPlayerName, setPlayerId } = usePlayer()

  function onCodeChange(event) {
    setCode(event.target.value.toUpperCase())
  }

  function onNameChange(event) {
    setName(event.target.value)
  }

  async function sendJoinRoomRequest({ code, name }) {
    const response = await API.post('join-room', { playerName: name, roomCode: code })
    return response.data
  }

  const joinRoom = withErrorHandling(sendJoinRoomRequest)

  async function sendCreateRoomRequest({ name }) {
    const response = await API.post('create-room', { playerName: name })
    return response.data
  }

  const createRoom = withErrorHandling(sendCreateRoomRequest)

  async function onRoomCreateClick(event) {
    if (!name) {
      toast(<WarningAlert>Enter a name before joining a room!</WarningAlert>)
      return
    }

    const apiResponse = await createRoom({ name })
    if (!apiResponse) return
    const { roomCode, playerId } = apiResponse.data

    setPlayerName(name)
    setPlayerId(playerId)
    navigate(`/play?room=${roomCode}`)
  }

  async function onRoomJoinClick(event) {
    if (!name) {
      toast(<WarningAlert>Enter a name before joining a room!</WarningAlert>)
      return
    }

    if (!code) {
      toast(<WarningAlert>Enter a room code before joining a room!</WarningAlert>)
      return
    }

    const apiResponse = await joinRoom({ code, name })
    if (!toastApiError(apiResponse)) return
    const { roomCode, playerId } = apiResponse.data

    setPlayerName(name)
    setPlayerId(playerId)
    navigate(`/play?room=${roomCode}`)
  }

  return (
    <Main>
      <TypographyH1>Connect Four</TypographyH1>
      <section className="flex flex-col gap-5">
        <GameStartControl label="Name">
          <Input
            autoCorrect="off"
            spellCheck="false"
            maxLength={50}
            type="text"
            placeholder="Enter your name"
            onChange={onNameChange}
          />
        </GameStartControl>

        <div className="flex items-center h-full gap-5">
          <RoomCreate onRoomCreateClick={onRoomCreateClick} />
          <Separator orientation="vertical" />
          <RoomJoin code={code} onRoomJoinClick={onRoomJoinClick} onCodeChange={onCodeChange} />
        </div>
      </section>
      <div className="absolute right-5 bottom-5">
        <ThemeToggle />
      </div>
    </Main>
  )
}

