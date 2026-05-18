"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      gap={12}
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast w-full rounded-2xl shadow-elegant border border-stone-100/80 px-4 py-3.5 " +
            "bg-white/90 backdrop-blur-xl " +
            "data-[type=success]:border-emerald-100 data-[type=success]:shadow-emerald-500/5 " +
            "data-[type=error]:border-red-100 data-[type=error]:shadow-red-500/5 " +
            "data-[type=warning]:border-amber-100 data-[type=warning]:shadow-amber-500/5 " +
            "data-[type=info]:border-blue-100 data-[type=info]:shadow-blue-500/5",
          title: "text-sm font-semibold text-stone-800 group-data-[type=success]:text-emerald-800",
          description: "text-xs text-stone-500 mt-0.5",
          icon: "shrink-0 mr-3",
          content: "flex-1 min-w-0",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
