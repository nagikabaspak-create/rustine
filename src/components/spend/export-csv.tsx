"use client";

import { Button } from "@/components/ui/button";

export function ExportCsvButton({
  rows,
}: {
  rows: { name: string; amount: string; note: string; date: string }[];
}) {
  function download() {
    const header = "operateur,montant,note,date\n";
    const body = rows
      .map((r) =>
        [r.name, r.amount, `"${r.note.replaceAll('"', '""')}"`, r.date].join(","),
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rustine-spend.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <Button variant="outline" className="w-full touch-manipulation sm:w-auto" onClick={download}>
      Export CSV
    </Button>
  );
}
