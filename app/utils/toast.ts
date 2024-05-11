import { useEffect } from "react";
import { toast as showToast } from "sonner";
import type { Toast } from "./toast.server";

export const useToast = (toast?: Toast) => {
  useEffect(() => {
    if (!toast) return;

    showToast[toast.type](toast.title, {
      description: toast.message,
    });
  }, [toast]);
};
