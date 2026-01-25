type GraphPoint = { label: string; value: number };

type GraphProps = {
  data: GraphPoint[];
  title?: string;
};

const Graph = ({ data, title }: GraphProps) => {
  const max = Math.max(...data.map((p) => p.value), 1);
  const step = 100 / Math.max(data.length - 1, 1);
  const points = data
    .map((point, index) => {
      const x = index * step;
      const y = 100 - (point.value / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-[var(--cp-border)] bg-[var(--cp-surface)] p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--cp-foreground)]">{title ?? "Emotional progress"}</p>
        <span className="text-xs text-[var(--cp-secondary)]">Last 7 days</span>
      </div>
      <div className="h-40 w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
          <polyline
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            points={points}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--cp-accent)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--cp-accent)" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {data.map((point, index) => {
            const x = index * step;
            const y = 100 - (point.value / max) * 100;
            return (
              <circle
                key={point.label}
                cx={x}
                cy={y}
                r="1.8"
                fill="var(--cp-accent)"
                stroke="var(--cp-surface)"
                strokeWidth="0.6"
              />
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-[var(--cp-secondary)]">
        {data.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  );
};

export default Graph;

