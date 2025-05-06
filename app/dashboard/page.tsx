import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardStatCard from "@/components/dashboard/dashboard-stat-card";
import AttendanceChart from "@/components/dashboard/attendance-chart";
import RecentActivity from "@/components/dashboard/recent-activity";
import DepartmentAttendance from "@/components/dashboard/department-attendance";
import { getDashboardStats } from "@/lib/data";
import { EmployeeStatus } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
  const stats = getDashboardStats();

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
            description={`${Math.round(stats.presentCount / stats.totalEmployees * 100)}% of total employees`}
            icon="users"
            trend="up"
            trendValue="3%"
            status={EmployeeStatus.PRESENT}
          />
        </Link>
        
        <Link href="/attendance?status=absent">
          <DashboardStatCard
            title="Absent Today"
            value={stats.absentCount}
            description={`${Math.round(stats.absentCount / stats.totalEmployees * 100)}% of total employees`}
            icon="user-minus"
            trend="down"
            trendValue="1%"
            status={EmployeeStatus.ABSENT}
          />
        </Link>
        
        <Link href="/attendance?status=on_leave">
          <DashboardStatCard
            title="On Leave Today"
            value={stats.onLeaveCount}
            description={`${Math.round(stats.onLeaveCount / stats.totalEmployees * 100)}% of total employees`}
            icon="calendar"
            trend="up"
            trendValue="2%"
            status={EmployeeStatus.ON_LEAVE}
          />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
        
        <Card>
          <CardHeader>
            <CardTitle>Department Attendance</CardTitle>
            <CardDescription>
              Attendance by department for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DepartmentAttendance />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
      </div>
    </div>
  );
}