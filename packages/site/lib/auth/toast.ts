import { toast } from "sonner";
import {
  getAuthErrorInfo,
  type AuthErrorInfo,
} from "@/lib/auth/errors";

export const AUTH_TOAST_ID = "auth-error";

/**
 * Triggers a styled Sonner toast notification for an authentication error.
 * Uses a stable toast ID to prevent duplicate toasts from stacking.
 */
export function showAuthErrorToast(
  error: AuthErrorInfo | string,
): string | number | null {
  const info = typeof error === "string" ? getAuthErrorInfo(error) : error;
  if (!info) return null;

  const { title, description, variant } = info;
  const options = {
    id: AUTH_TOAST_ID,
    description,
    duration: 5000,
  };

  switch (variant) {
    case "info":
      return toast.info(title, options);
    case "warning":
      return toast.warning(title, options);
    case "error":
    default:
      return toast.error(title, options);
  }
}
