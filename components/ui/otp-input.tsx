import * as React from "react"
import { cn } from "@/lib/utils"

function OTPInput({
  className,
  length = 6,
  value,
  onChange,
  disabled,
  ...props
}: {
  className?: string
  length?: number
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
} & Omit<React.ComponentProps<"div">, "onChange">) {
  const [otp, setOtp] = React.useState<string[]>(Array(length).fill(""))
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const isControlled = value !== undefined
  const currentOtp = isControlled ? (value || "").split("").slice(0, length) : otp

  const handleChange = (val: string[]) => {
    if (!isControlled) setOtp(val)
    onChange?.(val.join(""))
  }

  const handleInput = (index: number, char: string) => {
    if (!/^\d$/.test(char)) return
    const newOtp = [...currentOtp]
    newOtp[index] = char
    handleChange(newOtp)

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      const newOtp = [...currentOtp]
      if (newOtp[index]) {
        newOtp[index] = ""
        handleChange(newOtp)
      } else if (index > 0) {
        newOtp[index - 1] = ""
        handleChange(newOtp)
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    if (!pasted) return
    const newOtp = [...currentOtp]
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i]
    }
    handleChange(newOtp)
    const nextIndex = Math.min(pasted.length, length - 1)
    inputRefs.current[nextIndex]?.focus()
  }

  return (
    <div
      data-slot="otp-input"
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={currentOtp[index] || ""}
          disabled={disabled}
          onChange={(e) => handleInput(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          className={cn(
            "h-12 w-10 rounded-lg border border-input bg-transparent text-center text-lg font-bold transition-colors outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:opacity-50",
            currentOtp[index] && "border-emerald-500 bg-emerald-50",
            "aria-invalid:border-destructive"
          )}
        />
      ))}
    </div>
  )
}

export { OTPInput }
