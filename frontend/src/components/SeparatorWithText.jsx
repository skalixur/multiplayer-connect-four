import { Separator } from "@radix-ui/react-dropdown-menu";

export function SeparatorWithText({ children }) {
  return (
    <div className="select-none h-[30%] flex sm:flex-col justify-center items-center sm:gap-2 gap-5">
      <Separator className="sm:hidden block" />
      <span>{children}</span>
      <Separator className="sm:hidden block" />
    </div>
  )
}
