"use client";

import { cn } from "@/shared/lib/utils";
import type { ReactNode } from "react";

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
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
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
          "relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-900/5 sm:p-8",
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
    </div>
  );
}
