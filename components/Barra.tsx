export function Barra({ feito, meta }: { feito: number; meta: number }) {
  const pct = meta > 0 ? Math.min(100, (feito / meta) * 100) : 0;
  return (
    <div className="h-[3px] w-full bg-line">
      <div
        className="h-full bg-accent transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
