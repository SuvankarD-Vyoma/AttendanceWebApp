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

// --- Fix: Avoid setState in render or action chain/ForwardRef context ---

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
          `http://115.187.62.16:8005/VYOMAUMSRestAPI/api/auth/generateToken`,
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
          "http://115.187.62.16:8005/VYOMAUMSRestAPI/api/admin/getAdminDashboardDetailsv1",
          { method: "POST", headers: myHeaders, body: raw }
        );

        if (!response.ok) throw new Error(`API call failed: ${response.status}`);
        const result = await response.json();

        const apiData = result?.data?.last_7days_summary || [];

        let processedData: any[] = [];
        if (Array.isArray(apiData)) {
          processedData = apiData.map((item: any) => {
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
        }
        // Avoid calling setState if unmounted
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
      <div className="h-[350px] flex items-center justify-center text-muted-foreground">
        Loading attendance data...
      </div>
    );

  if (error)
    return (
      <div className="h-[350px] flex items-center justify-center text-destructive">
        Error: {error}
      </div>
    );

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
    let cancelled = false;
    async function fetchDashboardStats() {
      try {
        const admin_Id = getCookie("admin_Id");

        const username = getCookie("username") || process.env.NEXT_PUBLIC_API_USERNAME || "hr0001";
        const password = getCookie("password") || process.env.NEXT_PUBLIC_API_PASSWORD || "admin@123";
        const credentials = `${username}:${password}`;
        const encoded = typeof window !== "undefined" ? window.btoa(credentials) : "";

        const tokenRes = await fetch(
          `http://115.187.62.16:8005/VYOMAUMSRestAPI/api/auth/generateToken`,
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
          "http://115.187.62.16:8005/VYOMAUMSRestAPI/api/admin/getAdminDashboardDetailsv1",
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
