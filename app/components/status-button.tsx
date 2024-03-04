import { forwardRef } from "react";
import type { ButtonProps } from "./ui/button.tsx";
import { Button } from "./ui/button.tsx";
import { cn } from "#app/utils/ui.ts";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";

export interface StatusButtonProps extends ButtonProps {
  status: "success" | "pending" | "error" | "idle";
}
export const StatusButton = forwardRef<HTMLButtonElement, StatusButtonProps>(
  ({ status, className, children, ...props }, ref) => {
    const statusIcon = {
      success: <CheckCircledIcon />,
      pending: <UpdateIcon className="animate-spin" />,
      error: (
        <CrossCircledIcon className="rounded-full bg-destructive text-destructive-foreground" />
      ),
      idle: null,
    }[status];

    return (
      <Button
        disabled={status === "pending"}
        ref={ref}
        className={cn("flex justify-center gap-x-4", className)}
        {...props}
      >
        {children}
        {statusIcon}
      </Button>
    );
  },
);

StatusButton.displayName = "StatusButton";
