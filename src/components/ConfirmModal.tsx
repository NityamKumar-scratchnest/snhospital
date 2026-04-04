type Props = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "danger"
  confirmDisabled?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null

  const confirmClass =
    variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-scratch-accent text-white hover:brightness-105"

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-scratch-text/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-scratch-border bg-scratch-surface p-6 shadow-xl">
        <h2 id="confirm-title" className="text-lg font-semibold text-scratch-text">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-scratch-muted">{description}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="rounded-full border border-scratch-border px-4 py-2 text-sm font-semibold text-scratch-text transition hover:bg-scratch-bg"
            data-cursor="pointer"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${confirmClass}`}
            data-cursor="pointer"
            disabled={confirmDisabled}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
