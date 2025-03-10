import { useNavigate } from "react-router";

export default ({ children }) => {
  const navigate = useNavigate()

  function onKeyPress(event) {
    navigate('/')
  }

  return (
    <main onContextMenu={onKeyPress} className="flex h-screen w-screen flex-col items-center justify-center text-center">
      {children}
    </main>
  )
};

