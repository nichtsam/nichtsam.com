import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { RocketIcon } from "@radix-ui/react-icons";
import { useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useSpinDelay } from "spin-delay";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

// we don't want to show the loading indicator on page load
let firstRender = true;

export function ToasterWithPageLoading() {
  const { toasts } = useToast();

  const navigation = useNavigation();
  const [pendingPath, setPendingPath] = useState("");
  const showLoader = useSpinDelay(Boolean(navigation.state !== "idle"), {
    delay: 400,
    minDuration: 1000,
  });

  useEffect(() => {
    if (firstRender) return;
    if (navigation.state === "idle") return;
    setPendingPath(navigation.location.pathname);
  }, [navigation]);

  useEffect(() => {
    firstRender = false;
  }, []);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}

      <Toast
        open={showLoader}
        onSwipeStart={(event) => event.preventDefault()}
        onSwipeCancel={(event) => event.preventDefault()}
        onSwipeMove={(event) => event.preventDefault()}
        onSwipeEnd={(event) => event.preventDefault()}
      >
        <div className="grid [grid-template-areas:'icon_title'_'icon_description'] [grid-template-columns:52px_auto]">
          <RocketIcon className="h-8 w-8 animate-wiggle self-center [grid-area:icon]" />
          <ToastTitle className="text-lg font-bold [grid-area:title]">
            Loading
          </ToastTitle>
          <ToastDescription className="truncate text-sm font-bold [grid-area:description]">
            Path: {pendingPath}
          </ToastDescription>
        </div>
      </Toast>

      <ToastViewport />
    </ToastProvider>
  );
}
