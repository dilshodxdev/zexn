import { AlertTriangle, RotateCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-danger/30 bg-danger-soft/20 p-6 text-center",
        className,
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-danger/30 bg-danger-soft text-danger">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-text">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            icon={<RotateCw className="h-3.5 w-3.5" />}
          >
            {t("ui.retry")}
          </Button>
        </div>
      )}
    </div>
  );
}
