"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function SpendChart({
  data,
}: {
  data: { name: string; cents: number }[];
}) {
  const rows = data.map((d) => ({ name: d.name, usd: d.cents / 100 }));
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">Pas encore de données.</p>;
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" />
          <XAxis dataKey="name" stroke="#8B9BB4" />
          <YAxis stroke="#8B9BB4" />
          <Tooltip
            contentStyle={{ background: "#121821", border: "1px solid #1E2A3A" }}
            formatter={(value) => [`${value ?? 0} USD`, "Spend"]}
          />
          <Bar dataKey="usd" fill="#5B8CFF" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
