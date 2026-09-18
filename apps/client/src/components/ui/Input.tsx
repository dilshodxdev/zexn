import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
  id?: string;
}

export function Input({
  label,
  error,
  hint,
  id: customId,
  className,
  disabled,
  ...props
}: InputProps) {
  const autoId = useId();
  const id = customId || autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-text">
        {label}
      </label>
      <input
        id={id}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full rounded-md border bg-surface-alt px-3 py-2 text-sm text-text placeholder:text-muted outline-none transition-colors",
          error ? "border-danger focus:border-danger" : "border-line focus:border-brand",
          disabled ? "cursor-not-allowed opacity-50" : "",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
