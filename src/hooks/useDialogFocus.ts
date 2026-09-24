import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function focusableElements(dialog: HTMLElement) {
  return [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (element) =>
      element.getAttribute("aria-hidden") !== "true" &&
      element.getClientRects().length > 0,
  );
}

export function useDialogFocus<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
) {
  const dialogRef = useRef<T>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const frame = window.requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.contains(document.activeElement)) return;
      const preferred = dialog.querySelector<HTMLElement>(
        "[data-dialog-initial-focus]",
      );
      (preferred ?? focusableElements(dialog)[0] ?? dialog).focus();
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = focusableElements(dialog);
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.isConnected)
        window.requestAnimationFrame(() => previouslyFocused.focus());
    };
  }, [open]);

  return dialogRef;
}
