"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { useTheme } from "next-themes";

// Generate mock data for the past 7 days
const generateData = () => {
  const today = new Date();
  const data = [];

  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, "EEE, MMM d");
    
    // Generate random but reasonable data
    const total = 35; // Total employees
    const present = Math.floor(Math.random() * 10) + 20; // Random between 20-30
    const absent = Math.floor(Math.random() * 5) + 2; // Random between 2-7
    const onLeave = total - present - absent; // The rest are on leave
    
    data.push({
      date: dateStr,
      Present: present,
      Absent: absent,
      "On Leave": onLeave,
    });
  }

  return data;
};

export default function AttendanceChart() {
  const [data] = useState(generateData);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: isDark ? "#aaa" : "#666", fontSize: 12 }}
            tickLine={{ stroke: isDark ? "#aaa" : "#666" }}
          />
          <YAxis 
            tick={{ fill: isDark ? "#aaa" : "#666", fontSize: 12 }}
            tickLine={{ stroke: isDark ? "#aaa" : "#666" }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? "#111" : "#fff",
              border: `1px solid ${isDark ? "#333" : "#ddd"}`,
              color: isDark ? "#fff" : "#000",
            }} 
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="Present" 
            stackId="1" 
            stroke="hsl(var(--chart-1))" 
            fill="hsl(var(--chart-1))" 
          />
          <Area 
            type="monotone" 
            dataKey="Absent" 
            stackId="1" 
            stroke="hsl(var(--chart-2))" 
            fill="hsl(var(--chart-2))" 
          />
          <Area 
            type="monotone" 
            dataKey="On Leave" 
            stackId="1" 
            stroke="hsl(var(--chart-3))" 
            fill="hsl(var(--chart-3))" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}