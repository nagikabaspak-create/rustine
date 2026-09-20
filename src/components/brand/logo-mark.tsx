import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[8px] bg-primary font-bold leading-none text-primary-foreground",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.52 }}
      aria-hidden
    >
      R
    </div>
  );
}

export function BrandLockup({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      <span className="text-[17px] font-semibold tracking-tight">Rustine</span>
    </div>
  );
}
