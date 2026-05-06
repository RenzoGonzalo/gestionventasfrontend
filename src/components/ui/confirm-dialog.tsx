import * as React from "react";
import { Button } from "./button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Volver",
  confirmVariant = "danger",
  busy,
  onConfirm,
  onCancel,
  children
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-900/40"
        onClick={onCancel}
        aria-label="Cerrar"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <div className="text-xl font-extrabold text-slate-900">{title}</div>
        {description ? <div className="mt-2 text-base text-slate-600">{description}</div> : null}

        {children ? <div className="mt-4">{children}</div> : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button size="lg" variant="secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button size="lg" variant={confirmVariant} onClick={onConfirm} disabled={busy}>
            {busy ? "Procesando..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
