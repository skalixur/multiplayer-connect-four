import { CircleAlert } from "lucide-react"

function WarningAlert({ children }) {
  return (
    <span className="flex items-center gap-2 text-destructive-foreground stroke-destructive-foreground">
      <CircleAlert />
      {children}
    </span>
  )
}

export default WarningAlert
