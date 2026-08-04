export function Barra({ feito, meta }: { feito: number; meta: number }) {
  const pct = meta > 0 ? Math.min(100, (feito / meta) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-borda">
      <div
        className="h-full rounded-full bg-acento transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
