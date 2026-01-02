// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import DashboardStatCard from "@/components/dashboard/dashboard-stat-card";
// import { EmployeeStatus } from "@/lib/types";
// import Link from "next/link";
// import { getCookie } from "cookies-next";
// import { getApiBaseUrl } from "@/lib/api-config";
// import dayjs from "dayjs";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   Legend,
// } from "recharts";

// // --- Fix: Avoid setState in render or action chain/ForwardRef context ---

// function AttendanceBarChartOverride() {
//   const [attendanceChartData, setAttendanceChartData] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     async function fetchAttendanceData() {
//       try {
//         setLoading(true);
//         const admin_Id = getCookie("admin_Id");

//         const username = getCookie("username") || process.env.NEXT_PUBLIC_API_USERNAME || "hr0001";
//         const password = getCookie("password") || process.env.NEXT_PUBLIC_API_PASSWORD || "admin@123";
//         const credentials = `${username}:${password}`;
//         const encoded = typeof window !== "undefined" ? window.btoa(credentials) : "";

//         const tokenRes = await fetch(
//           `${getApiBaseUrl()}auth/generateToken`,
//           {
//             method: "POST",
//             headers: {
//               "Authorization": `Basic ${encoded}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         if (!tokenRes.ok) throw new Error("Token generation failed");

//         const tokenData = await tokenRes.json();
//         const token = tokenData?.data?.access_token;
//         if (!token) throw new Error("No token received");

//         const endDate = dayjs();
//         const startDate = dayjs().subtract(6, "day");

//         const myHeaders = new Headers();
//         myHeaders.append("accept", "*/*");
//         myHeaders.append("Content-Type", "application/json");
//         myHeaders.append("Authorization", `Bearer ${token}`);

//         const raw = JSON.stringify({
//           admin_id: admin_Id,
//           from_date: startDate.format("DD-MM-YYYY"),
//           to_date: endDate.format("DD-MM-YYYY"),
//         });

//         const response = await fetch(
//           `${getApiBaseUrl()}admin/getAdminDashboardDetailsv1`,
//           { method: "POST", headers: myHeaders, body: raw }
//         );

//         if (!response.ok) throw new Error(`API call failed: ${response.status}`);
//         const result = await response.json();

//         const apiData = result?.data?.last_7days_summary || [];

//         let processedData: any[] = [];
//         if (Array.isArray(apiData)) {
//           processedData = apiData.map((item: any) => {
//             const date = dayjs(item.report_date);
//             const dayName = date.format("ddd");
//             const fullDate = date.format("DD MMM");

//             return {
//               day: `${dayName} ${fullDate}`,
//               Present: item.present_count || 0,
//               Absent: item.absent_count || 0,
//               OnLeave: item.on_leave_count || 0,
//             };
//           });
//         }
//         // Avoid calling setState if unmounted
//         if (!cancelled) {
//           setAttendanceChartData(processedData);
//           setError(null);
//         }
//       } catch (err) {
//         if (!cancelled) {
//           console.error("Failed to fetch attendance data:", err);
//           setError("Failed to load attendance data.");
//           setAttendanceChartData([]);
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     fetchAttendanceData();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   if (loading)
//     return (
//       <div className="h-[350px] flex items-center justify-center text-muted-foreground">
//         Loading attendance data...
//       </div>
//     );

//   if (error)
//     return (
//       <div className="h-[350px] flex items-center justify-center text-destructive">
//         Error: {error}
//       </div>
//     );

//   return (
//     <div className="h-[350px] w-full">
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart data={attendanceChartData} barSize={40}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="day" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="Present" fill="#06f75fff" radius={[8, 8, 0, 0]} />
//           <Bar dataKey="Absent" fill="#ea7878ff" radius={[8, 8, 0, 0]} />
//           <Bar dataKey="OnLeave" fill="#facc15" radius={[8, 8, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// export default function DashboardPage() {
//   const [stats, setStats] = useState({
//     presentCount: 0,
//     absentCount: 0,
//     onLeaveCount: 0,
//     totalEmployees: 1,
//     attendanceRate: 0,
//     absenceRate: 0,
//   });

//   useEffect(() => {
//     let cancelled = false;
//     async function fetchDashboardStats() {
//       try {
//         const admin_Id = getCookie("admin_Id");

//         const username = getCookie("username") || process.env.NEXT_PUBLIC_API_USERNAME || "hr0001";
//         const password = getCookie("password") || process.env.NEXT_PUBLIC_API_PASSWORD || "admin@123";
//         const credentials = `${username}:${password}`;
//         const encoded = typeof window !== "undefined" ? window.btoa(credentials) : "";

//         const tokenRes = await fetch(
//           `${getApiBaseUrl()}auth/generateToken`,
//           {
//             method: "POST",
//             headers: {
//               "Authorization": `Basic ${encoded}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         if (!tokenRes.ok) throw new Error("Token generation failed");

//         const tokenData = await tokenRes.json();
//         const token = tokenData?.data?.access_token;
//         if (!token) throw new Error("Token missing in response");

//         const today = dayjs().format("DD-MM-YYYY");

//         const res = await fetch(
//           `${getApiBaseUrl()}admin/getAdminDashboardDetailsv1`,
//           {
//             method: "POST",
//             headers: {
//               "accept": "*/*",
//               "Content-Type": "application/json",
//               "Authorization": `Bearer ${token}`,
//             },
//             body: JSON.stringify({
//               admin_id: admin_Id,
//               from_date: today,
//               to_date: today,
//             }),
//           }
//         );

//         if (!res.ok) throw new Error("Dashboard fetch failed");
//         const data = await res.json();

//         const d = data?.data?.current_day_summary || {};

//         if (!cancelled) setStats({
//           presentCount: d.present_count || 0,
//           absentCount: d.absent_count || 0,
//           onLeaveCount: d.on_leave_count || 0,
//           totalEmployees: d.total_count || 1,
//           attendanceRate: d.attendance_rate || 0,
//           absenceRate: d.absence_rate || 0,
//         });
//       } catch (err) {
//         console.error("Failed to fetch dashboard stats:", err);
//         if (!cancelled) setStats({
//           presentCount: 0,
//           absentCount: 0,
//           onLeaveCount: 0,
//           totalEmployees: 1,
//           attendanceRate: 0,
//           absenceRate: 0,
//         });
//       }
//     }

//     fetchDashboardStats();
//     return () => { cancelled = true; };
//   }, []);

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
//           <p className="text-muted-foreground">
//             Overview of employee attendance for today
//           </p>
//         </div>
//         <div className="flex items-center gap-4">
//           <div className="text-sm text-muted-foreground">
//             Today:{" "}
//             {new Date().toLocaleDateString("en-US", {
//               weekday: "long",
//               year: "numeric",
//               month: "long",
//               day: "numeric",
//             })}
//           </div>
//         </div>
//       </div>

//       {/* Cards */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         <Link href="/attendance?status=present">
//           <DashboardStatCard
//             title="Present Today"
//             value={stats.presentCount}
//             description={`${stats.attendanceRate.toFixed(0)}% of total employees`}
//             icon="users"
//             status={EmployeeStatus.PRESENT}
//           />
//         </Link>

//         <Link href="/absent-employees?status=absent">
//           <DashboardStatCard
//             title="Absent Today"
//             value={stats.absentCount}
//             description={`${stats.absenceRate.toFixed(0)}% of total employees`}
//             icon="user-minus"
//             status={EmployeeStatus.ABSENT}
//           />
//         </Link>

//         <Link href="/leave-employees?status=on_leave">
//           <DashboardStatCard
//             title="On Leave Today"
//             value={stats.onLeaveCount}
//             description={`${Math.round(
//               (stats.onLeaveCount / stats.totalEmployees) * 100
//             )}% of total employees`}
//             icon="calendar"
//             status={EmployeeStatus.ON_LEAVE}
//           />
//         </Link>
//       </div>

//       {/* Chart */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
//         <Card className="col-span-full lg:col-span-2">
//           <CardHeader>
//             <CardTitle>Attendance Trends</CardTitle>
//             <CardDescription>
//               Employee attendance patterns over the last 7 days
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <AttendanceBarChartOverride />
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }























"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardStatCard from "@/components/dashboard/dashboard-stat-card";
import { EmployeeStatus } from "@/lib/types";
import Link from "next/link";
import { getCookie } from "cookies-next";
import { getApiBaseUrl } from "@/lib/api-config";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LabelList,
} from "recharts";

// Custom label component for percentage display
const CustomLabel = (props: any) => {
  const { x, y, width, value, fill, index } = props;
  const isHoliday = props.chartData[index]?.isHoliday;

  // On holidays, hide all labels (no percentages, no text)
  if (isHoliday) {
    return null;
  }

  return (
    <g>
      <rect
        x={x + width / 2 - 28}
        y={y - 35}
        width={56}
        height={28}
        fill={fill}
        rx={4}
      />
      <text
        x={x + width / 2}
        y={y - 16}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={13}
        fontWeight="600"
      >
        {value > 0 ? `${Math.round((value / Math.max(...props.chartData.map((d: any) => Math.max(d.Present || 0, d.Absent || 0, d.OnLeave || 0, d.Holiday || 0)))) * 100)}%` : '0%'}
      </text>
      <polygon
        points={`${x + width / 2 - 6},${y - 7} ${x + width / 2 + 6},${y - 7} ${x + width / 2},${y - 2}`}
        fill={fill}
      />
    </g>
  );
};

// Modern tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isHoliday = payload[0]?.payload?.isHoliday;

    if (isHoliday) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
           <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-base">{label}</p>
           <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: '#74b70fca' }}
              />
              <span className="font-bold text-amber-500 text-base">Holiday</span>
           </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-base">{label}</p>
        {payload.map((entry: any, index: number) => (
          entry.value > 0 && entry.name !== 'Holiday' && (
          <div key={index} className="flex items-center justify-between gap-6 mb-2 last:mb-0">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{entry.name}</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-base">{entry.value}</span>
          </div>
          )
        ))}
      </div>
    );
  }
  return null;
};

// Custom legend
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex justify-center gap-8 mt-6 flex-wrap">
      {payload.map((entry: any, index: number) => {
        return (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded shadow-md"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {entry.value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

function AttendanceBarChartOverride() {
  const [attendanceChartData, setAttendanceChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAttendanceData() {
      try {
        setLoading(true);
        const admin_Id = getCookie("admin_Id");

        const username = getCookie("username") || process.env.NEXT_PUBLIC_API_USERNAME || "hr0001";
        const password = getCookie("password") || process.env.NEXT_PUBLIC_API_PASSWORD || "admin@123";
        const credentials = `${username}:${password}`;
        const encoded = typeof window !== "undefined" ? window.btoa(credentials) : "";

        const tokenRes = await fetch(
          `${getApiBaseUrl()}auth/generateToken`,
          {
            method: "POST",
            headers: {
              "Authorization": `Basic ${encoded}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!tokenRes.ok) throw new Error("Token generation failed");

        const tokenData = await tokenRes.json();
        const token = tokenData?.data?.access_token;
        if (!token) throw new Error("No token received");

        const endDate = dayjs();
        const startDate = dayjs().subtract(6, "day");

        const myHeaders = new Headers();
        myHeaders.append("accept", "*/*");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${token}`);

        const raw = JSON.stringify({
          admin_id: admin_Id,
          from_date: startDate.format("DD-MM-YYYY"),
          to_date: endDate.format("DD-MM-YYYY"),
        });

        const response = await fetch(
          `${getApiBaseUrl()}admin/getAdminDashboardDetailsv1`,
          { method: "POST", headers: myHeaders, body: raw }
        );

        if (!response.ok) throw new Error(`API call failed: ${response.status}`);
        const result = await response.json();

        const apiData = result?.data?.last_7days_summary || [];

        console.log(apiData);

        // Calculate max value for the week to set consistent height for Holiday bars
        const maxVal = Math.max(
          ...apiData.map((item: any) => 
            Math.max(item.present_count || 0, item.absent_count || 0, item.on_leave_count || 0)
          ), 
          1 // Default to 1 if all are 0
        );

        console.log(maxVal);



        let processedData: any[] = [];
        if (Array.isArray(apiData)) {
          processedData = apiData.map((item: any) => {
            const date = dayjs(item.report_date);
            const dayName = date.format("ddd");
            const fullDate = date.format("DD MMM");
            const isHoliday = item.holiday_status === 1;

            if (isHoliday) {
               return {
                  day: `${dayName} ${fullDate}`,
                  Present: 0,
                  Absent: 0,
                  OnLeave: 0,
                  Holiday: maxVal,
                  isHoliday: true
               };
            }

            return {
              day: `${dayName} ${fullDate}`,
              Present: item.present_count || 0,
              Absent: item.absent_count || 0,
              OnLeave: item.on_leave_count || 0,
              Holiday: 0,
              isHoliday: false
            };
          });
        }

        if (!cancelled) {
          setAttendanceChartData(processedData);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch attendance data:", err);
          setError("Failed to load attendance data.");
          setAttendanceChartData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAttendanceData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading)
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading attendance data...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="h-[400px] flex items-center justify-center text-destructive">
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl">⚠️</div>
          <p className="font-medium">Error: {error}</p>
        </div>
      </div>
    );

  return (
    <div className="h-[400px] w-full">
      <style jsx global>{`
        .recharts-bar-rectangle {
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        .recharts-bar-rectangle:hover {
          filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.2)) drop-shadow(0 3px 6px rgba(0, 0, 0, 0.15));
          transition: filter 0.2s ease;
        }
      `}</style>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={attendanceChartData} 
          barSize={45}
          barGap={6}
          margin={{ top: 50, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <filter id="shadow" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="4" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            vertical={false}
            opacity={0.5}
          />
          <XAxis 
            dataKey="day" 
            tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
            axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
            axisLine={{ stroke: '#d1d5db', strokeWidth: 2 }}
            tickLine={false}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.03)', radius: 8 }} />
          <Legend content={<CustomLegend />} />
          <Bar 
            dataKey="Present" 
            fill="#776de1ff"
            radius={[6, 6, 0, 0]}
            animationDuration={1000}
          >
            <LabelList 
              content={(props) => <CustomLabel {...props} chartData={attendanceChartData} fill="#3b82f6" />} 
            />
          </Bar>
          <Bar 
            dataKey="Absent" 
            fill="#c86a61a2"
            radius={[6, 6, 0, 0]}
            animationDuration={1000}
          >
            <LabelList 
              content={(props) => <CustomLabel {...props} chartData={attendanceChartData} fill="#fa7a7aff" />} 
            />
          </Bar>
          <Bar 
            dataKey="OnLeave" 
            fill="#8a94bbff"
            radius={[6, 6, 0, 0]}
            animationDuration={1000}
          >
            <LabelList 
              content={(props) => <CustomLabel {...props} chartData={attendanceChartData} fill="#a855f7" />} 
            />
          </Bar>
          <Bar 
            dataKey="Holiday" 
            fill="#74b70fca"
            radius={[6, 6, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    presentCount: 0,
    absentCount: 0,
    onLeaveCount: 0,
    totalEmployees: 1,
    attendanceRate: 0,
    absenceRate: 0,
    holidayCount: 0,
  });

  useEffect(() => {
    let cancelled = false;
    async function fetchDashboardStats() {
      try {
        const admin_Id = getCookie("admin_Id");

        const username = getCookie("username") || process.env.NEXT_PUBLIC_API_USERNAME || "hr0001";
        const password = getCookie("password") || process.env.NEXT_PUBLIC_API_PASSWORD || "admin@123";
        const credentials = `${username}:${password}`;
        const encoded = typeof window !== "undefined" ? window.btoa(credentials) : "";

        const tokenRes = await fetch(
          `${getApiBaseUrl()}auth/generateToken`,
          {
            method: "POST",
            headers: {
              "Authorization": `Basic ${encoded}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!tokenRes.ok) throw new Error("Token generation failed");

        const tokenData = await tokenRes.json();
        const token = tokenData?.data?.access_token;
        if (!token) throw new Error("Token missing in response");

        const today = dayjs().format("DD-MM-YYYY");

        const res = await fetch(
          `${getApiBaseUrl()}admin/getAdminDashboardDetailsv1`,
          {
            method: "POST",
            headers: {
              "accept": "*/*",
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              admin_id: admin_Id,
              from_date: today,
              to_date: today,
            }),
          }
        );

        if (!res.ok) throw new Error("Dashboard fetch failed");
        const data = await res.json();

        const d = data?.data?.current_day_summary || {};

        if (!cancelled) setStats({
          presentCount: d.present_count || 0,
          absentCount: d.absent_count || 0,
          onLeaveCount: d.on_leave_count || 0,
          totalEmployees: d.total_count || 1,
          attendanceRate: d.attendance_rate || 0,
          absenceRate: d.absence_rate || 0,
          holidayCount: d.holiday_status || 0,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        if (!cancelled) setStats({
          presentCount: 0,
          absentCount: 0,
          onLeaveCount: 0,
          totalEmployees: 1,
          attendanceRate: 0,
          absenceRate: 0,
          holidayCount: 0,
        });
      }
    }

    fetchDashboardStats();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of employee attendance for today
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Today:{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/attendance?status=present">
          <DashboardStatCard
            title="Present Today"
            value={stats.presentCount}
            description={`${stats.attendanceRate.toFixed(0)}% of total employees`}
            icon="users"
            status={EmployeeStatus.PRESENT}
          />
        </Link>

        <Link href="/absent-employees?status=absent">
          <DashboardStatCard
            title="Absent Today"
            value={stats.absentCount}
            description={`${stats.absenceRate.toFixed(0)}% of total employees`}
            icon="user-minus"
            status={EmployeeStatus.ABSENT}
          />
        </Link>

        <Link href="/leave-employees?status=on_leave">
          <DashboardStatCard
            title="On Leave Today"
            value={stats.onLeaveCount}
            description={`${Math.round(
              (stats.onLeaveCount / stats.totalEmployees) * 100
            )}% of total employees`}
            icon="calendar"
            status={EmployeeStatus.ON_LEAVE}
          />
        </Link>
      </div>

      {/* Chart */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>
              Employee attendance patterns over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceBarChartOverride />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

































//PIE CHART-----------------

// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import DashboardStatCard from "@/components/dashboard/dashboard-stat-card";
// import { EmployeeStatus } from "@/lib/types";
// import Link from "next/link";
// import { getCookie } from "cookies-next";
// import { getApiBaseUrl } from "@/lib/api-config";
// import dayjs from "dayjs";
// import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

// // Custom 3D Coin Pie Chart Component
// const CoinPieChart = ({ data }: any) => {
//   const COLORS = {
//     Present: '#5b20e5ff',
//     Absent: '#c4926eff',
//     OnLeave: '#06b6d4'
//   };

//   const RADIAN = Math.PI / 180;

//   const renderCustomLabel = ({
//     cx,
//     cy,
//     midAngle,
//     innerRadius,
//     outerRadius,
//     percent,
//     index,
//   }: any) => {
//     const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//     const x = cx + radius * Math.cos(-midAngle * RADIAN);
//     const y = cy + radius * Math.sin(-midAngle * RADIAN);

//     return (
//       <text
//         x={x}
//         y={y}
//         fill="white"
//         textAnchor={x > cx ? 'start' : 'end'}
//         dominantBaseline="central"
//         fontSize="14"
//         fontWeight="700"
//         style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
//       >
//         {`${(percent * 100).toFixed(0)}%`}
//       </text>
//     );
//   };

//   const CustomTooltip = ({ active, payload }: any) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 z-50">
//           <p className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">
//             {payload[0].name}
//           </p>
//           <p className="text-2xl font-extrabold" style={{ color: payload[0].payload.fill }}>
//             {payload[0].value} employees
//           </p>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//             {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}% of total
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="flex flex-col md:flex-row items-center justify-between w-full h-auto min-h-[450px] gap-8">
//       <style jsx global>{`
//         @keyframes coinSpin {
//           0% {
//             transform: rotateY(0deg);
//           }
//           100% {
//             transform: rotateY(360deg);
//           }
//         }
        
//         .recharts-pie-sector {
//           filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
//           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//           cursor: pointer;
//         }
        
//         .recharts-pie-sector:hover {
//           filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.4)) brightness(1.1);
//           transform: scale(1.05);
//         }
//       `}</style>

//       {/* Chart Section - Left Side */}
//       <div className="relative w-full md:w-[60%] h-[400px]">
//         {/* 3D Coin Base Shadow */}
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full bg-gradient-to-br from-gray-300 to-gray-400 opacity-20 blur-2xl" />

//         <ResponsiveContainer width="100%" height="100%">
//           <PieChart>
//             <defs>
//               {/* Metallic gradients for 3D coin effect */}
//               <radialGradient id="presentGradient" cx="30%" cy="30%">
//                 <stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
//                 <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
//                 <stop offset="100%" stopColor="#251a7aff" stopOpacity="1" />
//               </radialGradient>
//               <radialGradient id="absentGradient" cx="30%" cy="30%">
//                 <stop offset="0%" stopColor="#6a4d37ff" stopOpacity="1" />
//                 <stop offset="50%" stopColor="#6d4427ff" stopOpacity="1" />
//                 <stop offset="100%" stopColor="#d99658ff" stopOpacity="1" />
//               </radialGradient>
//               <radialGradient id="leaveGradient" cx="30%" cy="30%">
//                 <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
//                 <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
//                 <stop offset="100%" stopColor="#0891b2" stopOpacity="1" />
//               </radialGradient>
//             </defs>

//             {/* 3D Bottom Layer (Shadow) */}
//             <Pie
//               data={data}
//               cx="50%"
//               cy="52%"
//               startAngle={0}
//               endAngle={360}
//               innerRadius={0}
//               outerRadius={125}
//               paddingAngle={2}
//               dataKey="value"
//               isAnimationActive={false}
//               stroke="none"
//             >
//               {data.map((entry: any, index: number) => (
//                 <Cell
//                   key={`shadow-${index}`}
//                   fill="#00000040"
//                   stroke="none"
//                 />
//               ))}
//             </Pie>

//             {/* Main 3D Coin Layer */}
//             <Pie
//               data={data}
//               cx="50%"
//               cy="48%"
//               startAngle={0}
//               endAngle={360}
//               innerRadius={0}
//               outerRadius={130}
//               paddingAngle={3}
//               dataKey="value"
//               label={renderCustomLabel}
//               labelLine={false}
//               animationBegin={0}
//               animationDuration={1500}
//               animationEasing="ease-out"
//             >
//               {data.map((entry: any, index: number) => {
//                 const gradients: any = {
//                   'Present': 'url(#presentGradient)',
//                   'Absent': 'url(#absentGradient)',
//                   'OnLeave': 'url(#leaveGradient)'
//                 };
//                 return (
//                   <Cell
//                     key={`cell-${index}`}
//                     fill={gradients[entry.name] || COLORS[entry.name as keyof typeof COLORS]}
//                     stroke="white"
//                     strokeWidth={3}
//                   />
//                 );
//               })}
//             </Pie>

//             {/* Center highlight for 3D effect */}
//             <Pie
//               data={[{ value: 1 }]}
//               dataKey="value"
//               cx="50%"
//               cy="48%"
//               startAngle={0}
//               endAngle={360}
//               innerRadius={0}
//               outerRadius={30}
//               fill="white"
//               opacity={0.3}
//               isAnimationActive={false}
//               stroke="none"
//             />

//             <Tooltip content={<CustomTooltip />} />
//           </PieChart>
//         </ResponsiveContainer>

//         {/* Coin Edge Reflection */}
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[265px] h-[265px] rounded-full border-4 border-white opacity-20 pointer-events-none" />
//       </div>

//       {/* Information Section - Right Side */}
//       <div className="w-full md:w-[40%] flex flex-col gap-4 pr-4">
//         {data.map((entry: any, index: number) => {
//           const color = COLORS[entry.name as keyof typeof COLORS];
//           const percentage = ((entry.value / entry.total) * 100).toFixed(1);

//           return (
//             <div
//               key={index}
//               className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300"
//             >
//               <div className="flex items-center gap-4">
//                 {/* Arrow Color Indicator */}
//                 <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform">
//                   <svg
//                     width="20"
//                     height="20"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke={color}
//                     strokeWidth="2.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className="transform -rotate-45"
//                   >
//                     <line x1="5" y1="12" x2="19" y2="12"></line>
//                     <polyline points="12 5 19 12 12 19"></polyline>
//                   </svg>
//                 </div>

//                 <div className="flex flex-col">
//                   <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
//                     {entry.name}
//                   </span>
//                   <div className="flex items-baseline gap-1">
//                     <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
//                       {percentage}%
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="text-right">
//                 <span className="block text-2xl font-bold" style={{ color: color }}>
//                   {entry.value}
//                 </span>
//                 <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
//                   Employees
//                 </span>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// function AttendanceCoinChart() {
//   const [chartData, setChartData] = useState<any[]>([]);
//   const [totalCount, setTotalCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     async function fetchAttendanceData() {
//       try {
//         setLoading(true);
//         const admin_Id = getCookie("admin_Id");

//         const username = getCookie("username") || process.env.NEXT_PUBLIC_API_USERNAME || "hr0001";
//         const password = getCookie("password") || process.env.NEXT_PUBLIC_API_PASSWORD || "admin@123";
//         const credentials = `${username}:${password}`;
//         const encoded = typeof window !== "undefined" ? window.btoa(credentials) : "";

//         const tokenRes = await fetch(
//           `${getApiBaseUrl()}auth/generateToken`,
//           {
//             method: "POST",
//             headers: {
//               "Authorization": `Basic ${encoded}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         if (!tokenRes.ok) throw new Error("Token generation failed");

//         const tokenData = await tokenRes.json();
//         const token = tokenData?.data?.access_token;
//         if (!token) throw new Error("No token received");

//         const today = dayjs().format("DD-MM-YYYY");

//         const myHeaders = new Headers();
//         myHeaders.append("accept", "*/*");
//         myHeaders.append("Content-Type", "application/json");
//         myHeaders.append("Authorization", `Bearer ${token}`);

//         const raw = JSON.stringify({
//           admin_id: admin_Id,
//           from_date: today,
//           to_date: today,
//         });

//         const response = await fetch(
//           `${getApiBaseUrl()}admin/getAdminDashboardDetailsv1`,
//           { method: "POST", headers: myHeaders, body: raw }
//         );

//         if (!response.ok) throw new Error(`API call failed: ${response.status}`);
//         const result = await response.json();

//         const summary = result?.data?.current_day_summary || {};
//         const total = summary.total_count || 1;

//         const processedData = [
//           {
//             name: 'Present',
//             value: summary.present_count || 0,
//             total: total
//           },
//           {
//             name: 'Absent',
//             value: summary.absent_count || 0,
//             total: total
//           },
//           {
//             name: 'OnLeave',
//             value: summary.on_leave_count || 0,
//             total: total
//           },
//         ].filter(item => item.value > 0);

//         if (!cancelled) {
//           setChartData(processedData);
//           setTotalCount(total);
//           setError(null);
//         }
//       } catch (err) {
//         if (!cancelled) {
//           console.error("Failed to fetch attendance data:", err);
//           setError("Failed to load attendance data.");
//           setChartData([]);
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     fetchAttendanceData();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   if (loading)
//     return (
//       <div className="h-[450px] flex items-center justify-center">
//         <div className="flex flex-col items-center gap-4">
//           <div className="relative">
//             <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
//             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
//               <div className="w-8 h-8 bg-purple-600 rounded-full opacity-20 animate-pulse" />
//             </div>
//           </div>
//           <p className="text-sm font-semibold text-gray-600">Loading attendance data...</p>
//         </div>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="h-[450px] flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="text-6xl">⚠️</div>
//           <p className="font-bold text-red-600 text-lg">Error: {error}</p>
//         </div>
//       </div>
//     );

//   return (
//     <div className="relative">
//       <div className="text-center mb-6">
//         <h3 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">
//           Today's Attendance Overview
//         </h3>
//         <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
//           Total Employees: <span className="font-bold text-purple-600">{totalCount}</span>
//         </p>
//       </div>
//       <CoinPieChart data={chartData} />
//     </div>
//   );
// }

// export default function DashboardPage() {
//   const [stats, setStats] = useState({
//     presentCount: 0,
//     absentCount: 0,
//     onLeaveCount: 0,
//     totalEmployees: 1,
//     attendanceRate: 0,
//     absenceRate: 0,
//   });

//   useEffect(() => {
//     let cancelled = false;
//     async function fetchDashboardStats() {
//       try {
//         const admin_Id = getCookie("admin_Id");

//         const username = getCookie("username") || process.env.NEXT_PUBLIC_API_USERNAME || "hr0001";
//         const password = getCookie("password") || process.env.NEXT_PUBLIC_API_PASSWORD || "admin@123";
//         const credentials = `${username}:${password}`;
//         const encoded = typeof window !== "undefined" ? window.btoa(credentials) : "";

//         const tokenRes = await fetch(
//           `${getApiBaseUrl()}auth/generateToken`,
//           {
//             method: "POST",
//             headers: {
//               "Authorization": `Basic ${encoded}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         if (!tokenRes.ok) throw new Error("Token generation failed");

//         const tokenData = await tokenRes.json();
//         const token = tokenData?.data?.access_token;
//         if (!token) throw new Error("Token missing in response");

//         const today = dayjs().format("DD-MM-YYYY");

//         const res = await fetch(
//           `${getApiBaseUrl()}admin/getAdminDashboardDetailsv1`,
//           {
//             method: "POST",
//             headers: {
//               "accept": "*/*",
//               "Content-Type": "application/json",
//               "Authorization": `Bearer ${token}`,
//             },
//             body: JSON.stringify({
//               admin_id: admin_Id,
//               from_date: today,
//               to_date: today,
//             }),
//           }
//         );

//         if (!res.ok) throw new Error("Dashboard fetch failed");
//         const data = await res.json();

//         const d = data?.data?.current_day_summary || {};

//         if (!cancelled) setStats({
//           presentCount: d.present_count || 0,
//           absentCount: d.absent_count || 0,
//           onLeaveCount: d.on_leave_count || 0,
//           totalEmployees: d.total_count || 1,
//           attendanceRate: d.attendance_rate || 0,
//           absenceRate: d.absence_rate || 0,
//         });
//       } catch (err) {
//         console.error("Failed to fetch dashboard stats:", err);
//         if (!cancelled) setStats({
//           presentCount: 0,
//           absentCount: 0,
//           onLeaveCount: 0,
//           totalEmployees: 1,
//           attendanceRate: 0,
//           absenceRate: 0,
//         });
//       }
//     }

//     fetchDashboardStats();
//     return () => { cancelled = true; };
//   }, []);

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
//           <p className="text-muted-foreground">
//             Overview of employee attendance for today
//           </p>
//         </div>
//         <div className="flex items-center gap-4">
//           <div className="text-sm text-muted-foreground">
//             Today:{" "}
//             {new Date().toLocaleDateString("en-US", {
//               weekday: "long",
//               year: "numeric",
//               month: "long",
//               day: "numeric",
//             })}
//           </div>
//         </div>
//       </div>

//       {/* Cards */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         <Link href="/attendance?status=present">
//           <DashboardStatCard
//             title="Present Today"
//             value={stats.presentCount}
//             description={`${stats.attendanceRate.toFixed(0)}% of total employees`}
//             icon="users"
//             status={EmployeeStatus.PRESENT}
//           />
//         </Link>

//         <Link href="/absent-employees?status=absent">
//           <DashboardStatCard
//             title="Absent Today"
//             value={stats.absentCount}
//             description={`${stats.absenceRate.toFixed(0)}% of total employees`}
//             icon="user-minus"
//             status={EmployeeStatus.ABSENT}
//           />
//         </Link>

//         <Link href="/leave-employees?status=on_leave">
//           <DashboardStatCard
//             title="On Leave Today"
//             value={stats.onLeaveCount}
//             description={`${Math.round(
//               (stats.onLeaveCount / stats.totalEmployees) * 100
//             )}% of total employees`}
//             icon="calendar"
//             status={EmployeeStatus.ON_LEAVE}
//           />
//         </Link>
//       </div>

//       {/* 3D Coin Pie Chart */}
//       <div className="grid gap-4 md:grid-cols-1">
//         <Card className="col-span-full">
//           <CardHeader>
//             <CardTitle>Attendance Distribution</CardTitle>
//             <CardDescription>
//               Real-time breakdown of employee attendance status
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <AttendanceCoinChart />
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }