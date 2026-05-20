import * as React from "react"
import Image from "next/image"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function FileUpload({
  className,
  value,
  onChange,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  disabled,
  ...props
}: {
  className?: string
  value?: File | null
  onChange?: (file: File | null) => void
  accept?: string
  maxSize?: number
  disabled?: boolean
} & Omit<React.ComponentProps<"div">, "onChange" | "value">) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState(false)

  React.useEffect(() => {
    if (!value) {
      setPreview(null)
      setError(null)
    }
  }, [value])

  const handleFile = (file: File | null) => {
    setError(null)
    if (!file) {
      onChange?.(null)
      setPreview(null)
      return
    }
    if (maxSize && file.size > maxSize) {
      setError(`Ukuran file maksimal ${maxSize / 1024 / 1024}MB`)
      return
    }
    onChange?.(file)
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file || null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    handleFile(file || null)
  }

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors",
          "hover:border-emerald-400 hover:bg-emerald-50/50",
          dragOver && "border-emerald-500 bg-emerald-50",
          disabled && "pointer-events-none opacity-50",
          error ? "border-red-300 bg-red-50/50" : "border-input"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        {preview ? (
          <div className="relative">
            <Image src={preview} alt="Preview" width={0} height={0} sizes="100vw" className="h-auto w-auto max-h-32 rounded-lg object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleFile(null); if (inputRef.current) inputRef.current.value = "" }}
              className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload size={24} />
            <p className="text-sm font-medium">Klik atau seret file ke sini</p>
            <p className="text-xs">Maksimal {maxSize / 1024 / 1024}MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export { FileUpload }
