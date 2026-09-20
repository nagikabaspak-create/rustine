export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-4 pt-6">
        <div className="h-11 w-11 animate-pulse rounded-[12px] bg-primary/30" />
        <div className="h-10 w-72 animate-pulse rounded-md bg-secondary" />
        <div className="h-12 w-full max-w-xl animate-pulse rounded-full bg-[#161616]" />
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-80 min-w-[260px] flex-1 animate-pulse rounded-2xl bg-card" />
        ))}
      </div>
    </div>
  );
}
