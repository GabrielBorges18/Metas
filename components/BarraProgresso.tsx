interface BarraProgressoProps {
  progresso: number;
  concluidas: number;
  total: number;
  className?: string;
}

export default function BarraProgresso({ progresso, concluidas, total, className = '' }: BarraProgressoProps) {
  return (
    <div className={className}>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-white">{progresso}%</span>
        <span className="text-gray-400">{concluidas}/{total}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progresso}%` }}
        />
      </div>
    </div>
  );
}
