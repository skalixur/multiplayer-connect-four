import Game from "@/pages/Game/Game"
import Home from "@/pages/Home/Home"
import { Route, Routes } from "react-router"

export default function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="play" element={<Game />} />
    </Routes>
  )
}
