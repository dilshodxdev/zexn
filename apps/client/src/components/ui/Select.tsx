import { useId, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  id?: string;
}

export function Select({
  label,
  options,
  error,
  hint,
  id: customId,
  className,
  disabled,
  ...props
}: SelectProps) {
  const autoId = useId();
  const id = customId || autoId;
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-text">
        {label}
      </label>
      <select
        id={id}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full rounded-md border bg-surface-alt px-3 py-2 text-sm text-text outline-none transition-colors",
          error ? "border-danger focus:border-danger" : "border-line focus:border-brand",
          disabled ? "cursor-not-allowed opacity-50" : "",
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface text-text">
            {opt.label}
          </option>
        ))}
      </select>
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
