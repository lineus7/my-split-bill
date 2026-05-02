"use client";

import { cn } from "@/shared/lib/utils";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
};

export function Modal({
  open,
  title,
  children,
  onClose,
  className,
}: ModalProps) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 mx-auto flex max-w-[480px] items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className="absolute inset-0 bg-gray-900/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative w-full rounded-2xl border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl",
          className
        )}
      >
        {title && (
          <h2
            id="modal-title"
            className="mb-3 text-lg font-semibold text-gray-900"
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
