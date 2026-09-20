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
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
          <XAxis dataKey="name" stroke="#8a8a8a" />
          <YAxis stroke="#8a8a8a" />
          <Tooltip
            contentStyle={{ background: "#121212", border: "1px solid #333333" }}
            formatter={(value) => [`${value ?? 0} USD`, "Spend"]}
          />
          <Bar dataKey="usd" fill="#C8FF00" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
