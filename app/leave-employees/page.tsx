"use client";

import { useState, useEffect, useMemo } from "react";
import { getCookie } from "cookies-next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Calendar,
  TrendingUp,
  Search,
  UserCheck,
  Activity,
  HeartPulse,
  Coffee,
} from "lucide-react";
import { getEmployeeLeaveListByToday } from "@/app/leave-employees/api"; // Imported as instructed

function getTodayDateISO() {
  const today = new Date();
  // YYYY-MM-DD in local time
  return today.toISOString().slice(0, 10);
}

export default function LeaveAnalytics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [leaveData, setLeaveData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const admin_Id = getCookie("admin_Id");
  const todayISO = getTodayDateISO();

  // Fetch leave data using getEmployeeLeaveListByToday for *today* only
  useEffect(() => {
    async function fetchLeaves() {
      setLoading(true);
      setError(null);
      try {
        const res = await getEmployeeLeaveListByToday({
          admin_id: admin_Id as string,
          org_id: "1",
        });
        if (res && (res.status === 0 || res.status === undefined)) {
          setLeaveData(res.data);
        } else {
          setError(
            res?.message ||
            "Error fetching leave data"
          );
        }
      } catch (err) {
        setError("Error fetching leave data");
        console.error("Leave data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (admin_Id) 
      fetchLeaves();
  }, [admin_Id, todayISO]);

  // Memoized leave summary
  const leaveOverview = useMemo(() => {
    if (!leaveData) return {};
    return {
      totalLeave: leaveData.total_leave || 0,
      sickLeave: leaveData.sick_leave || 0,
      casualLeave: leaveData.casual_leave || 0,
      privilegeLeave: leaveData.privilege_leave || 0,
    };
  }, [leaveData]);

  // Employees
  const employees = useMemo(() => {
    if (!leaveData?.lstEmployeeLeaveHistory) return [];
    return leaveData.lstEmployeeLeaveHistory.map((emp: any) => ({
      empId: emp.emp_id,
      name: emp.employee_name,
      contactNumber: emp.contact_number,
      email: emp.email_address,
      designation: emp.designation,
      department: emp.department,
      leaveTypeId: emp.leave_type_id,
      leaveType: emp.leave_type,
      leaveStartDate: emp.leave_start_date,
      leaveEndDate: emp.leave_end_date,
    }));
  }, [leaveData]);

  const filteredEmployees = useMemo(() => {
    if (!employees || employees.length === 0) return [];
    return employees.filter((emp: any) =>
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  // Download report handler for today (may need different API if available for daily export)
  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const token = getCookie("token");
      // Keeping monthly endpoint, but for daily may be different (assumes this still works)
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL +
        "leave/download-daily-leave-report";
      // Try to use from_date & to_date params for today
      const res = await fetch(
        `${apiUrl}?admin_id=${admin_Id}&from_date=${todayISO}&to_date=${todayISO}&org_id=1`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to download leave report");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leave_report_${todayISO}.xlsx`;
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

  if (loading)
    return (
      <div className="flex items-center justify-center py-24 text-lg">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center py-24 text-lg text-red-600">
        Error: {error}
      </div>
    );

  // Today's formatted date string for heading
  const todayStr = new Date(todayISO).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // UI: Today leave list
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-3 dark:bg-blue-900 dark:text-blue-200">
                <TrendingUp className="w-4 h-4" />
                Leave Dashboard
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Today's Leave List
              </h1>
              <p className="text-gray-600 mt-2 dark:text-gray-300">
                Employees on leave for <span className="font-semibold">{todayStr}</span>.
              </p>
            </div>
            <div>
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
                    Export Today's List
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Leave Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Total Leave Today"
            value={leaveOverview.totalLeave}
            icon={<UserCheck className="w-8 h-8 text-blue-600 dark:text-blue-300" />}
            bg="bg-blue-100 dark:bg-blue-900"
          />
          <SummaryCard
            title="Sick Leave"
            value={leaveOverview.sickLeave}
            icon={<HeartPulse className="w-8 h-8 text-green-600 dark:text-green-300" />}
            bg="bg-green-100 dark:bg-green-900"
            color="text-green-600"
          />
          <SummaryCard
            title="Casual Leave"
            value={leaveOverview.casualLeave}
            icon={<Coffee className="w-8 h-8 text-amber-600 dark:text-amber-300" />}
            bg="bg-amber-100 dark:bg-amber-900"
            color="text-amber-600"
          />
          <SummaryCard
            title="Privilege Leave"
            value={leaveOverview.privilegeLeave}
            icon={
              <Activity className="w-8 h-8 text-purple-600 dark:text-purple-300" />
            }
            bg="bg-purple-100 dark:bg-purple-900"
            color="text-purple-600"
          />
        </div>

        {/* Employee Leave Cards Section */}
        <div>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-xl dark:text-gray-100">
                    Today's Employee Leaves
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">
                    Leave records for <span className="font-semibold">{todayStr}</span>
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
              {filteredEmployees.length === 0 ? (
                <div className="py-8 text-gray-500 text-center">
                  No one is on leave today.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {filteredEmployees.map((emp: any, idx: number) => (
                    <EmployeeLeaveBox key={idx} emp={emp} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Card summary for leave dashboard
function SummaryCard({ title, value, icon, bg, color }: any) {
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
          </div>
          <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Card appearance for each employee's leave info
function EmployeeLeaveBox({ emp }: { emp: any }) {
  return (
    <Card className="shadow border-0 mb-4 bg-white dark:bg-slate-900">
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
            {emp.name
              ?.split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">{emp.name}</span>
            <div className="text-sm text-gray-500 dark:text-gray-400">{emp.designation} &mdash; {emp.department}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Employee ID</span>
            <span className="block text-base text-gray-800 dark:text-gray-100">{emp.empId}</span>
          </div>
          <div>
            <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Leave Type</span>
            <Badge
              className={
                emp.leaveType === "Sick Leave"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : emp.leaveType === "Casual Leave"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                  : emp.leaveType === "Privilege Leave"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
              }
            >
              {emp.leaveType}
            </Badge>
          </div>
          <div>
            <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Start Date</span>
            <span className="block text-base text-gray-800 dark:text-gray-100">{emp.leaveStartDate}</span>
          </div>
          <div>
            <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">End Date</span>
            <span className="block text-base text-gray-800 dark:text-gray-100">{emp.leaveEndDate}</span>
          </div>
          <div>
            <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Contact</span>
            <span className="block text-base text-gray-800 dark:text-gray-100">{emp.contactNumber}</span>
          </div>
          <div>
            <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Email</span>
            <span className="block text-base text-gray-800 dark:text-gray-100">{emp.email}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
