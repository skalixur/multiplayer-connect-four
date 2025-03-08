import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import App from "./App.tsx"
import { Toaster } from "@/components/ui/sonner"
import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { PlayerProvider } from "./contexts/PlayerProvider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/">
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <PlayerProvider>
          <Toaster />
          <App />
        </PlayerProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
