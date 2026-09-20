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
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        variant === "default" && "border-primary/30 bg-primary/15 text-primary",
        variant === "success" && "border-success/30 bg-success/15 text-success",
        variant === "danger" && "border-destructive/30 bg-destructive/15 text-destructive",
        variant === "outline" && "border-border text-muted-foreground",
        variant === "muted" && "border-transparent bg-secondary text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
