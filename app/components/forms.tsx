import { useId, useRef } from "react";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Checkbox } from "./ui/checkbox.tsx";
import { useInputEvent } from "@conform-to/react";
import type { Root as CheckboxPrimitiveRoot } from "@radix-ui/react-checkbox";
import { Badge } from "./ui/badge.tsx";

export type Errors = (string | null | undefined)[] | null | undefined;
export interface ErrorListProps {
  errors?: Errors;
  errorId?: string;
}
export const ErrorList = ({ errorId, errors }: ErrorListProps) => {
  const errorsToRender = errors?.filter(Boolean);
  if (!errorsToRender?.length) return null;

  return (
    <ul id={errorId} className="text-de my-2 flex flex-col gap-2">
      {errors!.map((error) => (
        <li key={error}>
          <Badge variant="destructive">{error}</Badge>
        </li>
      ))}
    </ul>
  );
};

export interface FieldProps {
  labelProps: Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "htmlFor">;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  errors?: (string | null | undefined)[] | null | undefined;
  help?: string;
}
export const Field = ({ labelProps, inputProps, errors, help }: FieldProps) => {
  const fallbackId = useId();
  const id = inputProps.id ?? fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className="my-2">
      <Label htmlFor={id} {...labelProps} />
      {help && <p className="mb-1 text-xs text-muted-foreground">{help}</p>}
      <Input
        aria-invalid={!!errorId}
        aria-describedby={errorId}
        {...inputProps}
        id={id}
      />
      <ErrorList errorId={errorId} errors={errors} />
    </div>
  );
};

export interface CheckboxFieldProps {
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  labelProps: Omit<React.LabelHTMLAttributes<HTMLLabelElement>, "htmlFor">;
  checkboxProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitiveRoot>,
    "type"
  >;
  errors?: (string | null | undefined)[] | null | undefined;
  help?: string;
}
export const CheckboxField = ({
  inputProps: { id: inputId, ...inputProps },
  labelProps,
  checkboxProps,
  errors,
  help,
}: CheckboxFieldProps) => {
  const fallbackId = useId();
  const id = inputId ?? fallbackId;
  const interactionId = `interaction-${id}`;
  const errorId = errors?.length
    ? inputProps["aria-describedby"] ?? `${id}-error`
    : undefined;

  const shadowInputRef = useRef<HTMLInputElement>(null);
  const { change, blur, focus } = useInputEvent({
    ref: shadowInputRef,
  });

  return (
    <div className="my-4">
      <div className="items-top flex gap-x-1">
        <input id={id} ref={shadowInputRef} {...inputProps} hidden />
        <Checkbox
          id={interactionId}
          aria-invalid={!!errorId}
          aria-describedby={errorId}
          {...checkboxProps}
          onCheckedChange={(state) => {
            change(state);
            checkboxProps?.onCheckedChange?.(state);
          }}
          onBlur={(event) => {
            blur();
            checkboxProps?.onBlur?.(event);
          }}
          onFocus={(event) => {
            focus();
            checkboxProps?.onFocus?.(event);
          }}
        />
        <div className="flex flex-col gap-1 leading-none">
          <Label htmlFor={interactionId} {...labelProps} />
          {help && <p className="text-xs text-muted-foreground">{help}</p>}
        </div>
      </div>
      <ErrorList errorId={errorId} errors={errors} />
    </div>
  );
};
