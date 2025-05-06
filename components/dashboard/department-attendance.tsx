"use client";

import { useTheme } from "next-themes";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const departmentData = [
  { name: "Engineering", value: 15, color: "hsl(var(--chart-1))" },
  { name: "Marketing", value: 8, color: "hsl(var(--chart-2))" },
  { name: "Finance", value: 5, color: "hsl(var(--chart-3))" },
  { name: "HR", value: 3, color: "hsl(var(--chart-4))" },
  { name: "Product", value: 4, color: "hsl(var(--chart-5))" },
];

export default function DepartmentAttendance() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={departmentData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {departmentData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? "#111" : "#fff",
              border: `1px solid ${isDark ? "#333" : "#ddd"}`,
              color: isDark ? "#fff" : "#000",
            }} 
            formatter={(value, name) => [
              `${value} employees`, 
              name
            ]}
          />
          <Legend 
            verticalAlign="bottom" 
            iconSize={10} 
            iconType="circle"
            wrapperStyle={{ paddingTop: "15px" }}
            formatter={(value, entry, index) => (
              <span style={{ color: isDark ? "#ddd" : "#333", marginRight: "10px" }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}