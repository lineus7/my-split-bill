"use client";

import { useRef, useState, useEffect } from "react";
import { Modal } from "@/shared/components/ui/modal";
import { Button } from "@/shared/components/ui/button";
import { scanBillAction, type ScanBillState } from "../actions/scan-bill";
import { useBillDraftStore } from "../stores/bill-draft-store";
import type { ScanBillResult } from "../schemas/scan-bill-schema";

type Phase =
  | { step: "idle" }
  | { step: "preview"; file: File; objectUrl: string }
  | { step: "loading" }
  | { step: "error"; message: string }
  | { step: "confirm"; data: ScanBillResult };

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ScanBillModal({ open, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>({ step: "idle" });
  const { title, items, taxAmount, serviceAmount, additionalCharges, loadDraft } =
    useBillDraftStore();

  const isDraftNonEmpty =
    title.trim().length > 0 ||
    items.length > 0 ||
    taxAmount > 0 ||
    serviceAmount > 0 ||
    additionalCharges.length > 0;

  // Revoke object URL on unmount if still in preview
  useEffect(() => {
    return () => {
      if (phase.step === "preview") {
        URL.revokeObjectURL(phase.objectUrl);
      }
    };
  }, [phase]);

  function handleClose() {
    setPhase({ step: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhase({ step: "error", message: "Please select a valid image file." });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setPhase({ step: "error", message: "Image must be smaller than 8 MB." });
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPhase({ step: "preview", file, objectUrl });
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  async function handleScan() {
    if (phase.step !== "preview") return;
    const file = phase.file;
    URL.revokeObjectURL(phase.objectUrl);
    setPhase({ step: "loading" });

    const fd = new FormData();
    fd.set("image", file);
    const result: ScanBillState = await scanBillAction({}, fd);

    if (result.error || !result.data) {
      setPhase({ step: "error", message: result.error ?? "Unknown error occurred." });
      return;
    }

    if (isDraftNonEmpty) {
      setPhase({ step: "confirm", data: result.data });
    } else {
      loadDraft(result.data);
      handleClose();
    }
  }

  function handleConfirmReplace() {
    if (phase.step !== "confirm") return;
    loadDraft(phase.data);
    handleClose();
  }

  function resetToIdle() {
    setPhase({ step: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <Modal open={open} title="Scan Bill from Photo" onClose={handleClose}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {phase.step === "idle" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Take a photo or upload an image of your receipt, and AI will automatically fill in the bill details.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-8 text-gray-500 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600"
          >
            <svg
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
              />
            </svg>
            <span className="text-sm font-medium">Tap to take photo or upload image</span>
          </button>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      )}

      {phase.step === "preview" && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={phase.objectUrl}
              alt="Receipt preview"
              className="max-h-64 w-full object-contain"
            />
          </div>
          <Button onClick={handleScan}>Scan with AI</Button>
          <Button variant="secondary" onClick={resetToIdle}>
            Choose another image
          </Button>
        </div>
      )}

      {phase.step === "loading" && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-gray-700">Analyzing receipt…</p>
          <p className="text-xs text-gray-400">This may take a few seconds</p>
        </div>
      )}

      {phase.step === "error" && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-800">{phase.message}</p>
          </div>
          <Button onClick={resetToIdle}>Try again</Button>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      )}

      {phase.step === "confirm" && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Replace current draft?</p>
              <p className="mt-1 text-xs text-gray-500">
                This will overwrite your current bill data with the scanned receipt.
              </p>
            </div>
          </div>
          <Button onClick={handleConfirmReplace}>Yes, replace draft</Button>
          <Button variant="secondary" onClick={onClose}>
            Keep current draft
          </Button>
        </div>
      )}
    </Modal>
  );
}
