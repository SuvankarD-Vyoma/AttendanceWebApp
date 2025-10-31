"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardStatCard from "@/components/dashboard/dashboard-stat-card";
import { EmployeeStatus } from "@/lib/types";
import Link from "next/link";
import { getCookie } from "cookies-next";
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
} from "recharts";

function AttendanceBarChartOverride() {
  const [attendanceChartData, setAttendanceChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAttendanceData() {
      try {
        setLoading(true);
        const admin_Id = getCookie("admin_Id");
        const tokenUrl = process.env.NEXT_PUBLIC_API_URL_AUTH;

        // Step 1: Generate token
        const tokenRes = await fetch(`${tokenUrl}auth/generateToken`, {
          method: "POST",
          headers: {
            "Authorization": "Basic dGVzdDAwMDE6YWRtaW5AMTIz",
            "Content-Type": "application/json",
          },
        });
        if (!tokenRes.ok) throw new Error("Token generation failed");

        const tokenData = await tokenRes.json();
        const token = tokenData.data.access_token;

        // Step 2: Define date range (last 7 days)
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

        // Step 3: Fetch data
        const response = await fetch(
          "https://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/admin/getAdminDashboardDetailsv1",
          {
            method: "POST",
            headers: myHeaders,
            body: raw,
          }
        );

        if (!response.ok) throw new Error(`API call failed: ${response.status}`);
        const result = await response.json();

        // Step 4: Extract last_7days_summary from the new API structure
        const apiData = result?.data?.last_7days_summary || [];

        if (!Array.isArray(apiData)) {
          console.warn("Unexpected API format:", result);
          setAttendanceChartData([]);
          return;
        }

        // Step 5: Map processed chart data
        const processedData = apiData.map((item: any) => {
          // Convert YYYY-MM-DD to display format
          const date = dayjs(item.report_date);
          const dayName = date.format("ddd");
          const fullDate = date.format("DD MMM");

          return {
            day: `${dayName} ${fullDate}`,
            Present: item.present_count || 0,
            Absent: item.absent_count || 0,
            OnLeave: item.on_leave_count || 0,
          };
        });

        setAttendanceChartData(processedData);
      } catch (err) {
        console.error("Failed to fetch attendance data for chart:", err);
        setError("Failed to load attendance data.");
        setAttendanceChartData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAttendanceData();
  }, []);

  if (loading) {
    return (
      <div className="h-[350px] flex items-center justify-center text-muted-foreground">
        Loading attendance data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[350px] flex items-center justify-center text-destructive">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={attendanceChartData} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Present" fill="#22c55e" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Absent" fill="#ef4444" radius={[8, 8, 0, 0]} />
          <Bar dataKey="OnLeave" fill="#facc15" radius={[8, 8, 0, 0]} />
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
  });

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const admin_Id = getCookie("admin_Id");
        const tokenUrl = process.env.NEXT_PUBLIC_API_URL_AUTH;

        const tokenRes = await fetch(`${tokenUrl}auth/generateToken`, {
          method: "POST",
          headers: {
            "Authorization": "Basic dGVzdDAwMDE6YWRtaW5AMTIz",
            "Content-Type": "application/json",
          },
        });
        if (!tokenRes.ok) throw new Error("Token generation failed");

        const tokenData = await tokenRes.json();
        const token = tokenData.data.access_token;

        const today = dayjs().format("DD-MM-YYYY");

        const res = await fetch(
          "https://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/admin/getAdminDashboardDetailsv1",
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
        
        // Use current_day_summary from the new API structure
        const d = data.data.current_day_summary;

        setStats({
          presentCount: d.present_count,
          absentCount: d.absent_count,
          onLeaveCount: d.on_leave_count,
          totalEmployees: d.total_count || 1,
          attendanceRate: d.attendance_rate,
          absenceRate: d.absence_rate,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setStats({
          presentCount: 0,
          absentCount: 0,
          onLeaveCount: 0,
          totalEmployees: 1,
          attendanceRate: 0,
          absenceRate: 0,
        });
      }
    }

    fetchDashboardStats();
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
            color="#22c55e"
          />
        </Link>

        <Link href="/absent-employees?status=absent">
          <DashboardStatCard
            title="Absent Today"
            value={stats.absentCount}
            description={`${stats.absenceRate.toFixed(0)}% of total employees`}
            icon="user-minus"
            status={EmployeeStatus.ABSENT}
            color="#ef4444"
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
            color="#facc15"
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