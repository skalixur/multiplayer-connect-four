import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"

import Main from "../Main"
import GameStartControl from "./GameStartControl"
import RoomCreate from "./RoomCreate"
import RoomJoin from "./RoomJoin"

import { SeparatorWithText } from "@/components/SeparatorWithText"
import WarningAlert from "@/components/WarningAlert"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { TypographyH1 } from "@/components/ui/typography"

import { usePlayer } from "@/hooks/usePlayer"
import { API } from "@/lib/api"
import toastApiError from "@/lib/toastApiError"
import withErrorHandling from "@/lib/withErrorHandling"

export default function Home() {
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const navigate = useNavigate()
  const { setPlayerName, setPlayerId } = usePlayer()

  const onCodeChange = (event) => setCode(event.target.value.toUpperCase())
  const onNameChange = (event) => setName(event.target.value)

  const sendJoinRoomRequest = async ({ code, name }) => {
    const response = await API.post("join-room", { playerName: name, roomCode: code })
    return response.data
  }

  const sendCreateRoomRequest = async ({ name }) => {
    const response = await API.post("create-room", { playerName: name })
    return response.data
  }

  const joinRoom = withErrorHandling(sendJoinRoomRequest)
  const createRoom = withErrorHandling(sendCreateRoomRequest)

  const onRoomCreateClick = async () => {
    if (!name) {
      toast(<WarningAlert>Enter a name before creating a room!</WarningAlert>)
      return
    }

    const apiResponse = await createRoom({ name })
    if (!apiResponse) return

    const { roomCode, playerId } = apiResponse.data
    setPlayerName(name)
    setPlayerId(playerId)
    navigate(`/play?room=${roomCode}`)
  }

  const onRoomJoinClick = async () => {
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
      <div className="my-8">
        <TypographyH1>Connect Four</TypographyH1>
      </div>
      <section className="flex flex-col gap-8 items-center">
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
        <div className="flex flex-col justify-center sm:flex-row items-center h-full gap-5">
          <RoomCreate onRoomCreateClick={onRoomCreateClick} />
          <SeparatorWithText>or</SeparatorWithText>
          <RoomJoin code={code} onRoomJoinClick={onRoomJoinClick} onCodeChange={onCodeChange} />
        </div>
      </section>
      <div className="absolute right-5 bottom-5">
        <ThemeToggle />
      </div>
    </Main>
  )
}
