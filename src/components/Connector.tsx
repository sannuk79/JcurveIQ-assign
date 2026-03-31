

interface ConnectorProps {
  type: 'straight' | 'branch' | 'merge';
  className?: string;
}

export function Connector({ type, className = '' }: ConnectorProps) {
  if (type === 'straight') {
    return (
      <div className={`flex flex-col items-center h-8 ${className}`}>
        <div className="w-px h-full bg-slate-700"></div>
      </div>
    );
  }

  if (type === 'branch') {
    return (
      <div className={`relative h-12 w-full flex justify-center ${className}`}>
        <svg
          className="absolute inset-0 w-full h-full text-slate-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          preserveAspectRatio="none"
        >
          <path d="M 50% 0 L 50% 50% M 0 50% L 100% 50% M 10% 50% L 10% 100% M 50% 50% L 50% 100% M 90% 50% L 90% 100%" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center h-8 ${className}`}>
      <div className="w-px h-full bg-slate-700"></div>
    </div>
  );
}
