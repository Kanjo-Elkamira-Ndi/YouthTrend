import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { message: string; onRetry?: () => void };

export const InlineError = ({ message, onRetry }: Props) => (
  <div className="w-full rounded-xl bg-red-500/8 border border-red-500/20 p-4 flex items-center gap-3">
    <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
    <p className="text-sm flex-1">{message}</p>
    {onRetry && (
      <Button size="sm" variant="outline" onClick={onRetry}>
        <RefreshCw className="h-3.5 w-3.5" /> Retry
      </Button>
    )}
  </div>
);

export default InlineError;
