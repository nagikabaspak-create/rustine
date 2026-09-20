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
    return <p className="px-2 text-sm text-muted-foreground sm:px-0">Pas encore de données.</p>;
  }
  return (
    <div className="h-56 w-full min-w-0 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
          <XAxis dataKey="name" stroke="#8a8a8a" tick={{ fontSize: 11 }} />
          <YAxis stroke="#8a8a8a" width={40} tick={{ fontSize: 11 }} />
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
