import { cn } from '@/lib/utils';

interface HeatBarProps {
  value: number; // 0 to 1
  label?: string;
  color?: 'orange' | 'red' | 'blue';
  showValue?: boolean;
  className?: string;
}

export function HeatBar({ value, label, color = 'orange', showValue = true, className }: HeatBarProps) {
  const percentage = Math.round(value * 100);

  const colorVar = {
    orange: '--intensity-orange',
    red: '--tribal-red',
    blue: '--bias-left',
  }[color];

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1 flex items-center justify-between">
          {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
          {showValue && <span className="text-xs font-semibold" style={{ color: `hsl(var(${colorVar}))` }}>{percentage}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: `hsl(var(${colorVar}))`,
            opacity: 0.3 + value * 0.7,
          }}
        />
      </div>
    </div>
  );
}
