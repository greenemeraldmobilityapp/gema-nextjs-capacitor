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

const orderStatusConfig: Record<string, { bg: string; text: string; border: string; icon: LucideIcon }> = {
  pending: { bg: "bg-amber-50/80", text: "text-amber-700", border: "border border-amber-200/50", icon: Clock },
  accepted: { bg: "bg-blue-50/80", text: "text-blue-700", border: "border border-blue-200/50", icon: Check },
  in_progress: { bg: "bg-emerald-50/80", text: "text-emerald-700", border: "border border-emerald-200/50", icon: RefreshCw },
  completed: { bg: "bg-stone-100/80", text: "text-stone-600", border: "border border-stone-200/50", icon: CheckCircle },
  cancelled: { bg: "bg-red-50/80", text: "text-red-600", border: "border border-red-200/50", icon: XCircle },
}

const paymentStatusConfig: Record<string, { bg: string; text: string; border: string; icon: LucideIcon }> = {
  unpaid: { bg: "bg-amber-50/80", text: "text-amber-700", border: "border border-amber-200/50", icon: AlertCircle },
  escrow: { bg: "bg-blue-50/80", text: "text-blue-700", border: "border border-blue-200/50", icon: Shield },
  released: { bg: "bg-emerald-50/80", text: "text-emerald-700", border: "border border-emerald-200/50", icon: CheckCircle },
  refunded: { bg: "bg-red-50/80", text: "text-red-600", border: "border border-red-200/50", icon: RotateCcw },
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
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm",
        item.bg,
        item.text,
        item.border,
        className
      )}
    >
      <Icon className="size-3" />
      {labels[status] ?? status}
    </span>
  )
}

export { StatusBadge }
