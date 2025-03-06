import About from "@/pages/About"
import Home from "@/pages/Home"
import MainLayout from "@/pages/MainLayout"
import { Route, Routes } from "react-router"

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  )
}
