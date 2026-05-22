const items = [
  ["Available", "bg-blue-100 border-blue-200"],
  ["Occupied", "bg-slate-100 border-slate-200"],
  ["Selected", "bg-sky-500 border-sky-500"],
  ["Your seat", "bg-emerald-100 border-emerald-300"],
];

export function SeatLegend() {
  return (
    <div className="flex flex-wrap gap-4 rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm">
      {items.map(([label, className]) => (
        <div key={label} className="flex items-center gap-2">
          <span className={`h-5 w-5 rounded-md border ${className}`} />
          {label}
        </div>
      ))}
    </div>
  );
}
