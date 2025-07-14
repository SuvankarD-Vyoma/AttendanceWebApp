"use client";

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardStatCard from "@/components/dashboard/dashboard-stat-card";
import AttendanceChart from "@/components/dashboard/attendance-chart";
import RecentActivity from "@/components/dashboard/recent-activity";
import { EmployeeStatus } from "@/lib/types";
import Link from "next/link";
import { getCookie } from "cookies-next";
import dayjs from "dayjs";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    presentCount: 0,
    absentCount: 0,
    onLeaveCount: 0,
    totalEmployees: 1, // avoid division by zero
    attendanceRate: 0,
    absenceRate: 0
  });

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        // 1. Get credentials from cookies
        const username = getCookie("username");
        const password = getCookie("password"); // Only if you store password (not recommended for security)
        const userId = getCookie("userId");

        // 2. Generate token
        const Genarate_Token = process.env.NEXT_PUBLIC_API_URL_AUTH;
        const tokenResponse = await fetch(`${Genarate_Token}auth/generateToken`, {
          method: "POST",
          headers: {
            "Authorization": "Basic dGVzdDAwMDE6YWRtaW5AMTIz",
            "Content-Type": "application/json",
          },
        });

        if (!tokenResponse.ok) throw new Error("Token generation failed");
        const tokenData = await tokenResponse.json();
        const token = tokenData.data.access_token;

        // 3. Call dashboard API
        const today = dayjs().format("DD-MM-YYYY");
        const dashboardResponse = await fetch(
          "https://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/admin/getAdminDashboardDetails",
          {
            method: "POST",
            headers: {
              "accept": "*/*",
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              admin_user_id: userId,
              from_date: today,
              to_date: today,
            }),
          }
        );

        if (!dashboardResponse.ok) throw new Error("Dashboard fetch failed");
        const dashboardData = await dashboardResponse.json();
        const d = dashboardData.data;

        setStats({
          presentCount: d.present_count,
          absentCount: d.absent_count,
          onLeaveCount: d.on_leave_count,
          totalEmployees: d.present_count + d.absent_count + d.on_leave_count || 1,
          attendanceRate: d.attendance_rate,
          absenceRate: d.absence_rate,
        });
      } catch (err) {
        // fallback or error handling
        setStats({
          presentCount: 0,
          absentCount: 0,
          onLeaveCount: 0,
          totalEmployees: 1,
          attendanceRate: 0,
          absenceRate: 0
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
            Today: {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
      </div>

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

        <Link href="/attendance?status=absent">
          <DashboardStatCard
            title="Absent Today"
            value={stats.absentCount}
            description={`${Math.round(stats.absentCount / stats.totalEmployees * 100)}% of total employees`}
            icon="user-minus"
            status={EmployeeStatus.ABSENT}
          />
        </Link>

        <Link href="/attendance?status=on_leave">
          <DashboardStatCard
            title="On Leave Today"
            value={stats.onLeaveCount}
            description={`0% of total employees`}
            icon="calendar"


            status={EmployeeStatus.ON_LEAVE}
          />
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>
              Employee attendance patterns over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceChart />
          </CardContent>
        </Card>

      </div>

      {/* <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest employee check-ins and check-outs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}