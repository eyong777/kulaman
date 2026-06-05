"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const colors = ["#0d62b6", "#1493b8", "#16a34a", "#f59e0b", "#dc2626", "#475569"];

export function CategoryChart({ data }: { data: { name: string; total: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
