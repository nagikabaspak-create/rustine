import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "success" | "danger" | "outline" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        variant === "default" && "border-primary/30 bg-primary/15 text-primary",
        variant === "success" && "border-[#3DDC97]/30 bg-[#3DDC97]/15 text-[#3DDC97]",
        variant === "danger" && "border-destructive/30 bg-destructive/15 text-destructive",
        variant === "outline" && "border-border text-muted-foreground",
        variant === "muted" && "border-transparent bg-secondary text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
