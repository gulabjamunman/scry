import { cn } from '@/lib/utils';

interface SpectrumBarProps {
  value: number; // -1 (left) to 1 (right)
  showLabels?: boolean;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SpectrumBar({ value, showLabels = true, height = 'md', className }: SpectrumBarProps) {
  const position = ((value + 1) / 2) * 100; // Convert -1..1 to 0..100

  const heightClass = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }[height];

  return (
    <div className={cn("w-full", className)}>
      {showLabels && (
        <div className="mb-1 flex justify-between text-[10px] font-medium text-muted-foreground">
          <span className="text-bias-left">Left</span>
          <span className="text-bias-center">Center</span>
          <span className="text-bias-right">Right</span>
        </div>
      )}
      <div className={cn("relative w-full rounded-full overflow-hidden", heightClass)}>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, hsl(var(--bias-left)), hsl(var(--bias-center)) 50%, hsl(var(--bias-right)))`,
            opacity: 0.2,
          }}
        />
        <div
          className="absolute top-0 h-full w-1 rounded-full bg-foreground shadow-sm transition-all duration-300"
          style={{ left: `calc(${position}% - 2px)` }}
        />
      </div>
    </div>
  );
}
