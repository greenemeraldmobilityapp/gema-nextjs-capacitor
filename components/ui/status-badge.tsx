import { cn } from "@/lib/utils"
import {
  Clock,
  Check,
  RefreshCw,
  CheckCircle,
  XCircle,
  Shield,
  AlertCircle,
  RotateCcw,
  LucideIcon,
} from "lucide-react"

const orderStatusConfig: Record<string, { bg: string; text: string; icon: LucideIcon }> = {
  pending: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
  accepted: { bg: "bg-blue-100", text: "text-blue-700", icon: Check },
  in_progress: { bg: "bg-blue-100", text: "text-blue-700", icon: RefreshCw },
  completed: { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle },
  cancelled: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
}

const paymentStatusConfig: Record<string, { bg: string; text: string; icon: LucideIcon }> = {
  unpaid: { bg: "bg-yellow-100", text: "text-yellow-700", icon: AlertCircle },
  escrow: { bg: "bg-blue-100", text: "text-blue-700", icon: Shield },
  released: { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle },
  refunded: { bg: "bg-red-100", text: "text-red-700", icon: RotateCcw },
}

const labels: Record<string, string> = {
  pending: "Menunggu",
  accepted: "Diterima",
  in_progress: "Diproses",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  unpaid: "Belum Dibayar",
  escrow: "Escrow",
  released: "Dibayarkan",
  refunded: "Dikembalikan",
}

function StatusBadge({
  status,
  type = "order",
  className,
}: {
  status: string
  type?: "order" | "payment"
  className?: string
}) {
  const config = type === "payment" ? paymentStatusConfig : orderStatusConfig
  const item = config[status]
  if (!item) return null

  const Icon = item.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        item.bg,
        item.text,
        className
      )}
    >
      <Icon className="size-3" />
      {labels[status] ?? status}
    </span>
  )
}

export { StatusBadge }
