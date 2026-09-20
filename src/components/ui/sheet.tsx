"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;
export const SheetTitle = SheetPrimitive.Title;
export const SheetDescription = SheetPrimitive.Description;

export function SheetContent({
  className,
  children,
  side = "left",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "left" | "right";
}) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <SheetPrimitive.Content
        className={cn(
          "fixed z-50 flex h-full max-h-dvh w-[min(100vw,18rem)] flex-col bg-background p-4 shadow-xl outline-none",
          side === "left"
            ? "left-0 top-0 border-r border-border"
            : "right-0 top-0 border-l border-border",
          className,
        )}
        {...props}
      >
        <SheetPrimitive.Title className="sr-only">Navigation</SheetPrimitive.Title>
        <SheetPrimitive.Description className="sr-only">
          Menu principal Rustine
        </SheetPrimitive.Description>
        {children}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}
