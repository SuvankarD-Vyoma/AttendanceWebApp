"use client";

import { useState, useEffect, useMemo } from "react";
import { getCookie } from "cookies-next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Search,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getAttendenceSummaryDetails } from "@/app/reports/api";

export default function AttendanceAnalytics() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const admin_Id = getCookie("admin_Id");
  const month_number = parseInt(selectedMonth.split("-")[1]);
  const year_number = parseInt(selectedMonth.split("-")[0]);

  // ✅ Fetch attendance summary data
  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAttendenceSummaryDetails(
          admin_Id as string,
          month_number,
          year_number
        );
        if (res?.status === 0) {
          setAttendanceSummary(res.data);
        } else {
          setError(res?.message || "Error fetching attendance summary");
        }
      } catch (err) {
        console.error("Attendance summary fetch error:", err);
        setError("Error fetching attendance summary");
      } finally {
        setLoading(false);
      }
    }

    if (admin_Id && month_number && year_number) fetchSummary();
  }, [admin_Id, month_number, year_number]);

  // 🧮 Derived data for UI
  const monthlyOverview = useMemo(() => {
    if (!attendanceSummary) return {};
    const summary = attendanceSummary.attendence_summary;
    return {
      totalEmployees: summary?.total_employee || 0,
      present: summary?.present_employee || 0,
      late: summary?.late_employee || 0,
      absent: summary?.absent_employee || 0,
      attendanceRate: summary?.attendance_rate || 0,
    };
  }, [attendanceSummary]);

  const monthlyChartData = useMemo(() => {
    if (!attendanceSummary) return [];
    const summary = attendanceSummary.attendence_summary;
    return [
      {
        status: "Present",
        count: summary?.present_employee || 0,
        percentage: summary?.attendance_rate || 0,
        color: "#22c55e",
      },
      {
        status: "Late",
        count: summary?.late_employee || 0,
        percentage: summary?.late_rate || 0,
        color: "#f59e0b",
      },
      {
        status: "Absent",
        count: summary?.absent_employee || 0,
        percentage: summary?.absent_rate || 0,
        color: "#ef4444",
      },
    ];
  }, [attendanceSummary]);

  const employees = useMemo(() => {
    return (
      attendanceSummary?.employee_summary?.map((emp: any) => ({
        name: emp?.employee_name ? emp.employee_name.toString() : "",
        empId: emp?.employee_code?.toString() || "-",
        present: emp?.present_count || 0,
        late: emp?.late_count || 0,
        absent: emp?.absent_count || 0,
        presentPercent: Number(emp?.attendance_rate || 0),
      })) || []
    );
  }, [attendanceSummary]);
  

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp: any) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  // ⬇️ Download report handler
  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const token = getCookie("token");
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL +
        "attendance/download-monthly-report";
      const res = await fetch(
        `${apiUrl}?month=${selectedMonth}&admin_id=${admin_Id}&year=${year_number}&month_number=${month_number}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to download report");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_report_${selectedMonth}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Error downloading report");
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // ✅ Render UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-3 dark:bg-blue-900 dark:text-blue-200">
                <TrendingUp className="w-4 h-4" />
                Analytics Dashboard
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Monthly Attendance Report
              </h1>
              <p className="text-gray-600 mt-2 dark:text-gray-300">
                Comprehensive attendance analytics and employee summaries
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
                <Calendar className="w-5 h-5 text-gray-500" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border-0 bg-transparent focus:outline-none dark:text-gray-100"
                />
              </div>
              <Button
                onClick={handleDownloadReport}
                disabled={downloading}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                {downloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title="Total Employees"
            value={monthlyOverview.totalEmployees}
            icon={<Users className="w-8 h-8 text-blue-600 dark:text-blue-300" />}
            bg="bg-blue-100 dark:bg-blue-900"
          />
          <SummaryCard
            title="Total Present"
            value={monthlyOverview.present}
            sub={`${monthlyChartData[0]?.percentage}% attendance`}
            icon={<Clock className="w-8 h-8 text-green-600 dark:text-green-300" />}
            bg="bg-green-100 dark:bg-green-900"
            color="text-green-600"
          />
          <SummaryCard
            title="Total Late"
            value={monthlyOverview.late}
            sub={`${monthlyChartData[1]?.percentage}% of total`}
            icon={<Clock className="w-8 h-8 text-amber-600 dark:text-amber-300" />}
            bg="bg-amber-100 dark:bg-amber-900"
            color="text-amber-600"
          />
          <SummaryCard
            title="Total Absent"
            value={monthlyOverview.absent}
            sub={`${monthlyChartData[2]?.percentage}% of total`}
            icon={<Clock className="w-8 h-8 text-red-600 dark:text-red-300" />}
            bg="bg-red-100 dark:bg-red-900"
            color="text-red-600"
          />
        </div>

        {/* Bar Chart */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-xl dark:text-gray-100">
              Monthly Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="status" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {monthlyChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employee Table */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-xl dark:text-gray-100">
                  Employee Attendance Summary
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">
                  Monthly breakdown for{" "}
                  {new Date(selectedMonth).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4">Employee</th>
                    <th className="text-center py-4 px-4">Employee ID</th>
                    <th className="text-center py-4 px-4">Present</th>
                    <th className="text-center py-4 px-4">Late</th>
                    <th className="text-center py-4 px-4">Absent</th>
                    <th className="text-center py-4 px-4">Attendance %</th>
                    <th className="text-right py-4 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp: any, idx: number) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {emp.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {emp.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">{emp.empId}</td>
                      <td className="text-center">
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          {emp.present}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                          {emp.late}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                          {emp.absent}
                        </Badge>
                      </td>
                      <td className="text-center">
                        {emp.presentPercent.toFixed(2)}%
                      </td>
                      <td className="text-right">
                        <Badge
                          className={
                            emp.presentPercent >= 90
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : emp.presentPercent >= 75
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          }
                        >
                          {emp.presentPercent >= 90
                            ? "Excellent"
                            : emp.presentPercent >= 75
                            ? "Good"
                            : "Poor"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, sub, icon, bg, color }: any) {
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p
              className={`text-3xl font-bold mt-2 ${
                color || "text-gray-900 dark:text-gray-100"
              }`}
            >
              {value}
            </p>
            {sub && (
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                {sub}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
