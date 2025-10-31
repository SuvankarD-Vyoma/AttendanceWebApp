"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, Users, Clock, TrendingUp, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

export default function AttendanceAnalytics() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Mock data - Replace with actual API data
  const monthlyOverview = {
    totalWorkingDays: 22,
    present: 450,
    late: 45,
    absent: 15,
    totalEmployees: 25
  };

  const monthlyChartData = [
    { status: "Present", count: 450, percentage: 88.2, color: "#10b981" },
    { status: "Late", count: 45, percentage: 8.8, color: "#f59e0b" },
    { status: "Absent", count: 15, percentage: 3.0, color: "#ef4444" }
  ];

  const employeeAttendance = [
    { id: 1, name: "John Doe", empId: "EMP001", present: 19, late: 2, absent: 1, presentPercent: 86.4 },
    { id: 2, name: "Jane Smith", empId: "EMP002", present: 21, late: 1, absent: 0, presentPercent: 95.5 },
    { id: 3, name: "Mike Johnson", empId: "EMP003", present: 18, late: 3, absent: 1, presentPercent: 81.8 },
    { id: 4, name: "Sarah Williams", empId: "EMP004", present: 22, late: 0, absent: 0, presentPercent: 100.0 },
    { id: 5, name: "Robert Brown", empId: "EMP005", present: 20, late: 1, absent: 1, presentPercent: 90.9 },
    { id: 6, name: "Emily Davis", empId: "EMP006", present: 19, late: 2, absent: 1, presentPercent: 86.4 },
    { id: 7, name: "David Wilson", empId: "EMP007", present: 21, late: 1, absent: 0, presentPercent: 95.5 },
    { id: 8, name: "Lisa Anderson", empId: "EMP008", present: 17, late: 3, absent: 2, presentPercent: 77.3 },
  ];

  // Removed selectedEmployee and dropdown related code

  const filteredEmployees = useMemo(() => {
    return employeeAttendance.filter(emp => 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Generate monthly attendance data for each employee (day by day)
  const generateEmployeeMonthlyData = (employee) => {
    const daysInMonth = monthlyOverview.totalWorkingDays;
    const dailyData = [];
    let presentCount = 0, lateCount = 0, absentCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      let status;
      // Distribute the totals across the month
      if (presentCount < employee.present && Math.random() > 0.2) {
        status = "Present";
        presentCount++;
      } else if (lateCount < employee.late && Math.random() > 0.5) {
        status = "Late";
        lateCount++;
      } else if (absentCount < employee.absent) {
        status = "Absent";
        absentCount++;
      } else {
        status = "Present";
        presentCount++;
      }

      dailyData.push({
        day: `Day ${day}`,
        status: status,
        value: status === "Present" ? 1 : status === "Late" ? 0.5 : 0
      });
    }
    return dailyData;
  };

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL + "attendance/download-monthly-report";
      const res = await fetch(apiUrl + `?month=${selectedMonth}`, {
        method: "GET",
      });

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
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Present": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "Late": return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
      case "Absent": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-700";
    }
  };

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
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2 dark:text-gray-100">{monthlyOverview.totalEmployees}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl dark:bg-blue-900">
                  <Users className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Present</p>
                  <p className="text-3xl font-bold text-green-600 mt-2 dark:text-green-400">{monthlyOverview.present}</p>
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">{monthlyChartData[0].percentage}% attendance</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl dark:bg-green-900">
                  <Clock className="w-8 h-8 text-green-600 dark:text-green-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Late</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2 dark:text-amber-400">{monthlyOverview.late}</p>
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">{monthlyChartData[1].percentage}% of total</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl dark:bg-amber-900">
                  <Clock className="w-8 h-8 text-amber-600 dark:text-amber-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Absent</p>
                  <p className="text-3xl font-bold text-red-600 mt-2 dark:text-red-400">{monthlyOverview.absent}</p>
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">{monthlyChartData[2].percentage}% of total</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl dark:bg-red-900">
                  <Clock className="w-8 h-8 text-red-600 dark:text-red-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Overview Chart */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-xl dark:text-gray-100">Monthly Attendance Overview</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">Attendance distribution for the selected month</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="status" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'count') return [value, 'Count'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {monthlyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Employee Attendance Summary */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-xl dark:text-gray-100">Employee Attendance Summary - Monthly</CardTitle>
                <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">
                  Monthly individual attendance breakdown for {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Employee</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Employee ID</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Present</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Late</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Absent</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Attendance %</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{employee.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">{employee.empId}</td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300">
                          {employee.present}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300">
                          {employee.late}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300">
                          {employee.absent}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div 
                              className="bg-blue-600 h-2 rounded-full dark:bg-blue-500" 
                              style={{ width: `${employee.presentPercent}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{employee.presentPercent}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Badge className={employee.presentPercent >= 90 ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : employee.presentPercent >= 75 ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}>
                            {employee.presentPercent >= 90 ? "Excellent" : employee.presentPercent >= 75 ? "Good" : "Poor"}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No employees found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}