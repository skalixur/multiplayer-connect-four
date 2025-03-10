import { Label } from "@/components/ui/label";


export default ({ label, children }) => {
  return (
    <div className="flex flex-col gap-2 sm:w-full w-[75%]">
      {label && (
        <Label htmlFor={children.id} className="scroll-m-20 text-2xl font-semibold tracking-tight">
          {label}
        </Label>
      )}
      {children}
    </div>
  )
};
