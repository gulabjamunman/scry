import { AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WarningIndicatorProps {
  level: number; // 0 to 1
  label?: string;
  className?: string;
}

export function WarningIndicator({ level, label, className }: WarningIndicatorProps) {
  const isHigh = level > 0.6;
  const isMedium = level > 0.3;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isHigh ? (
        <AlertTriangle className="h-4 w-4 text-tribal" />
      ) : isMedium ? (
        <AlertTriangle className="h-4 w-4 text-intensity" />
      ) : (
        <Shield className="h-4 w-4 text-safe" />
      )}
      <span className={cn(
        "text-xs font-semibold",
        isHigh && "text-tribal",
        isMedium && !isHigh && "text-intensity",
        !isMedium && "text-safe",
      )}>
        {label || (isHigh ? 'High Risk' : isMedium ? 'Moderate' : 'Low Risk')}
      </span>
    </div>
  );
}
