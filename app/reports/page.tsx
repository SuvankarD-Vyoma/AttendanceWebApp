"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
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
  ChevronDown,
  ChevronUp,
  Check,
  ChevronLeft,
  ChevronRight
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

// Safely check if we're on the client-side (browser) before using dynamic import
const isClient = typeof window !== "undefined";

// Redesigned dropdown for selecting report type
function ReportTypeDropdown({ selectedType, setSelectedType, goToEntryExit }: any) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const options = [
    {
      label: "Attendance Summary",
      value: "attendance",
      onClick: () => setSelectedType("attendance"),
      icon: <Users className="w-4 h-4 mr-2 text-blue-600" />,
    },
    {
      label: "Entry/Exit Time",
      value: "entryexit",
      onClick: goToEntryExit,
      icon: <Clock className="w-4 h-4 mr-2 text-indigo-600" />,
    },
  ];

  const selectedOption = options.find(opt =>
    selectedType === "attendance" ? opt.value === "attendance" : opt.value === "entryexit"
  ) || options[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 shadow-sm min-w-[185px] font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
      >
        <span className="flex items-center">
          {selectedOption.icon}
          {selectedOption.label}
        </span>
        <span className="ml-auto pl-2 flex items-center">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>
      {open && (
        <ul
          className="absolute right-0 z-20 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 animate-fade-in"
          role="listbox"
        >
          {options.map(opt => (
            <li
              key={opt.value}
              onClick={() => {
                setOpen(false);
                if (opt.value === "attendance") {
                  setSelectedType("attendance");
                } else {
                  goToEntryExit();
                }
              }}
              className={`flex items-center px-4 py-2 cursor-pointer transition-colors ${selectedType === opt.value
                ? "bg-blue-50 dark:bg-blue-900 font-semibold text-blue-700 dark:text-blue-200"
                : "hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              role="option"
              aria-selected={selectedType === opt.value}
            >
              {opt.icon}
              <span className="flex-1">{opt.label}</span>
              {selectedType === opt.value && (
                <Check className="w-4 h-4 text-blue-600 ml-2" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AttendanceAnalytics() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("attendance");
  const [currentPage, setCurrentPage] = useState(1);

  // NEW: Manual date range selection
  const [manualStartDate, setManualStartDate] = useState<string>("");
  const [manualEndDate, setManualEndDate] = useState<string>("");

  const rowsPerPage = 10;

  const router = useRouter();

  const admin_Id = getCookie("admin_Id");

  // month_number and year_number from selectedMonth
  const month_number = parseInt(selectedMonth.split("-")[1]);
  const year_number = parseInt(selectedMonth.split("-")[0]);

  // Derive start and end dates (DD-MM-YYYY format for the API)
  // If manual date range is set and valid, use those; otherwise, fall back to selectedMonth
  function getDateStringDMY(date: string) {
    // Date in YYYY-MM-DD format, convert to DD-MM-YYYY
    if (!date) return "";
    const [yyyy, mm, dd] = date.split("-");
    return `${dd}-${mm}-${yyyy}`;
  }

  // Generate default start/end for selectedMonth
  const defaultStartDate = `01-${month_number.toString().padStart(2, "0")}-${year_number}`;
  const daysInMonth = new Date(year_number, month_number, 0).getDate();
  const defaultEndDate = `${daysInMonth.toString().padStart(2, "0")}-${month_number.toString().padStart(2, "0")}-${year_number}`;

  // Use manual date range if both are specified; fallback to selectedMonth otherwise
  const effectiveStartDate = manualStartDate && manualEndDate ? getDateStringDMY(manualStartDate) : defaultStartDate;
  const effectiveEndDate = manualStartDate && manualEndDate ? getDateStringDMY(manualEndDate) : defaultEndDate;

  // Pass the formatted date strings directly to the API (DD-MM-YYYY format)
  const start_date = effectiveStartDate;
  const end_date = effectiveEndDate;

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      setError(null);
      try {
        const res = await getAttendenceSummaryDetails(
          admin_Id as string,
          start_date,
          end_date
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

    if (
      selectedType === "attendance" &&
      admin_Id &&
      start_date &&
      end_date
    ) {
      fetchSummary();
    }
  }, [admin_Id, start_date, end_date, selectedType]);

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
        color: "#873f39a2",
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
        raw: emp, // retain original for Excel export
      })) || []
    );
  }, [attendanceSummary]);

  // Reset page to 1 when search term/filter changes
  const filteredEmployees = useMemo(() => {
    setCurrentPage(1);
    return employees.filter((emp: any) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  // Calculate pagination
  const totalEmployeesCount = filteredEmployees.length;
  const totalPages = Math.ceil(totalEmployeesCount / rowsPerPage);

  // Show only paginated data
  const paginatedEmployees = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredEmployees.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredEmployees, currentPage]);

  function getAllDatesOfMonth(year: number, month: number) {
    const days = new Date(year, month, 0).getDate();
    const res: string[] = [];
    for (let d = 1; d <= days; d++) {
      const dd = d.toString().padStart(2, "0");
      const mm = month.toString().padStart(2, "0");
      res.push(`${year}-${mm}-${dd}`);
    }
    return res;
  }

  // Download Excel report 

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      if (!isClient) {
        alert("Excel export only supported in browser.");
        return;
      }
      let ExcelJS: any = null;
      try {
        ExcelJS = (await import("exceljs")).default;
        if (!ExcelJS) {
          throw new Error();
        }
      } catch (_) {
        alert(
          "Excel report download is not available because the 'exceljs' library could not be loaded on the client." +
          "\n\nPlease ensure 'exceljs' is installed with:\n\nnpm install exceljs\n\n" +
          "Reload the page after installing."
        );
        setDownloading(false);
        return;
      }
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Attendance Report`);
      // Use report title/interval for filename and header:
      let reportIntervalStr = "";
      if (manualStartDate && manualEndDate) {
        // Format "DD MMM YYYY - DD MMM YYYY"
        const fmt = (d: string) => {
          if (!d) return "";
          const dt = new Date(d);
          return dt.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        };
        reportIntervalStr = `${fmt(manualStartDate)} - ${fmt(manualEndDate)}`;
      } else {
        reportIntervalStr = new Date(selectedMonth).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      }
      const header: any[] = ["Employee Name"];
      header.push(`${reportIntervalStr} - Late Count`);
      header.push(`${reportIntervalStr} - Absent Count`);
      header.push(`${reportIntervalStr} - Present Count`);
      worksheet.addRow(header);

      employees.forEach((emp: any) => {
        const row: any[] = [emp.name];
        row.push(emp.late);
        row.push(emp.absent);
        row.push(emp.present);
        worksheet.addRow(row);
      });
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.columns = [
        { width: 25 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
      ];
      for (let row = 2; row <= employees.length + 1; row++) {
        for (let col = 2; col <= 4; col++) {
          worksheet.getCell(row, col).alignment = { horizontal: "center" };
        }
      }
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      if (manualStartDate && manualEndDate) {
        a.download = `attendance_report_${manualStartDate}_to_${manualEndDate}.xlsx`;
      } else {
        a.download = `attendance_report_${selectedMonth}.xlsx`;
      }
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(
        "Error downloading Excel report. " +
        (err instanceof Error ? err.message : "")
      );
      if (typeof console !== "undefined") {
        console.error(err);
      }
    } finally {
      setDownloading(false);
    }
  };

  function goToEntryExitPage() {
    router.push("/reports/entry-exitTime");
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, employees]);

  if (loading)
    return (
      <div className="text-center py-8 dark:text-gray-200">Loading...</div>
    );
  if (error)
    return (
      <div className="text-center py-8 text-red-500">Error: {error}</div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-3 dark:bg-blue-900 dark:text-blue-200">
                <TrendingUp className="w-4 h-4" /> Analytics Dashboard
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Monthly Attendance Report
              </h1>
              <p className="text-gray-600 mt-2 dark:text-gray-300">
                Comprehensive attendance analytics and employee summaries
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-stretch gap-3">
              <div className="flex items-center gap-3">
                <ReportTypeDropdown
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  goToEntryExit={goToEntryExitPage}
                />
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setManualStartDate(""); // reset manual override
                      setManualEndDate("");
                    }}
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
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />{" "}
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" /> Export Report
                    </>
                  )}
                </Button>
              </div>
              {/* NEW: Start/End date pickers UI section */}
              <div className="flex items-center gap-3 mt-3 md:mt-0">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">OR Custom Range:</span>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-lg px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
                  <label htmlFor="start-date" className="text-xs mr-2 text-gray-600 dark:text-gray-300">
                    Start
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    max={manualEndDate || undefined}
                    value={manualStartDate}
                    onChange={(e) => {
                      setManualStartDate(e.target.value);
                      // Unset selectedMonth so new report shows
                      if (e.target.value && manualEndDate) {
                        setSelectedMonth(
                          e.target.value.slice(0, 7)
                        );
                      }
                    }}
                    className="border-0 bg-transparent focus:outline-none dark:text-gray-100 text-xs"
                  />
                  <label htmlFor="end-date" className="text-xs ml-2 mr-2 text-gray-600 dark:text-gray-300">
                    End
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    min={manualStartDate || undefined}
                    value={manualEndDate}
                    onChange={(e) => {
                      setManualEndDate(e.target.value);
                      // Unset selectedMonth so new report shows
                      if (manualStartDate && e.target.value) {
                        setSelectedMonth(
                          manualStartDate.slice(0, 7)
                        );
                      }
                    }}
                    className="border-0 bg-transparent focus:outline-none dark:text-gray-100 text-xs"
                  />
                  {/* Reset */}
                  {(manualStartDate || manualEndDate) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setManualStartDate("");
                        setManualEndDate("");
                      }}
                      className="px-2 py-0 text-xs text-gray-400 dark:text-gray-400 hover:text-blue-700"
                      title="Clear date range"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Show only if attendance summary is selected */}
        {selectedType === "attendance" && (
          <>
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
                icon={
                  <Clock className="w-8 h-8 text-green-600 dark:text-green-300" />
                }
                bg="bg-green-100 dark:bg-green-900"
                color="text-green-600"
              />
              <SummaryCard
                title="Total Late"
                value={monthlyOverview.late}
                sub={`${monthlyChartData[1]?.percentage}% of total`}
                icon={
                  <Clock className="w-8 h-8 text-amber-600 dark:text-amber-300" />
                }
                bg="bg-amber-100 dark:bg-amber-900"
                color="text-amber-600"
              />
              <SummaryCard
                title="Total Absent"
                value={monthlyOverview.absent}
                sub={`${monthlyChartData[2]?.percentage}% of total`}
                icon={
                  <Clock className="w-8 h-8 text-red-600 dark:text-red-100" />
                }
                bg="bg-red-100 dark:bg-red-100"
                color="#873f39a2"
              />
            </div>

            {/* Bar Chart */}
            <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="text-xl dark:text-gray-100">
                  {manualStartDate && manualEndDate
                    ? "Attendance Overview for Custom Range"
                    : "Monthly Attendance Overview"}
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
                      {manualStartDate && manualEndDate
                        ? <>
                          Custom breakdown for{" "}
                          <span className="font-medium">
                            {new Date(manualStartDate).toLocaleDateString("en-US", {
                              day: "2-digit", month: "short", year: "numeric"
                            })}
                            {" - "}
                            {new Date(manualEndDate).toLocaleDateString("en-US", {
                              day: "2-digit", month: "short", year: "numeric"
                            })}
                          </span>
                        </>
                        : <>
                          Monthly breakdown for{" "}
                          {new Date(selectedMonth).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </>
                      }
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
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing{" "}
                    {totalEmployeesCount === 0
                      ? 0
                      : (currentPage - 1) * rowsPerPage + 1}
                    -
                    {Math.min(currentPage * rowsPerPage, totalEmployeesCount)}{" "}
                    of {totalEmployeesCount} employees
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                  />
                </div>
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
                      {paginatedEmployees.map((emp: any, idx: number) => (
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
                      {paginatedEmployees.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center text-gray-500 dark:text-gray-400"
                          >
                            No employees found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-3 flex-wrap gap-2">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing{" "}
                    {totalEmployeesCount === 0
                      ? 0
                      : (currentPage - 1) * rowsPerPage + 1}
                    -
                    {Math.min(currentPage * rowsPerPage, totalEmployeesCount)}{" "}
                    of {totalEmployeesCount} employees
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}
        {/* If entry-exitTime selected, you can optionally show a placeholder or nothing,
            as navigation happens when selecting entry/exit in the dropdown */}
      </div>
    </div>
  );
}

// Pagination component
function Pagination({
  currentPage,
  setCurrentPage,
  totalPages,
}: {
  currentPage: number;
  setCurrentPage: (n: number) => void;
  totalPages: number;
}) {
  // Only show page numbers for a few pages around currentPage
  const getPages = () => {
    const pages: number[] = [];
    const maxSteps = 2; // show... cur-2 ... cur ... cur+2
    let rangeStart = Math.max(1, currentPage - maxSteps);
    let rangeEnd = Math.min(totalPages, currentPage + maxSteps);
    // Adjust window if at start or end
    if (currentPage <= 3) {
      rangeEnd = Math.min(totalPages, 5);
    }
    if (currentPage >= totalPages - 2) {
      rangeStart = Math.max(1, totalPages - 4);
    }
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    return pages;
  };
  if (totalPages <= 1) return null;
  return (
    <nav className="flex items-center gap-2">
      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded px-2 py-1 text-sm text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {getPages().map((n) => (
        <button
          key={n}
          onClick={() => setCurrentPage(n)}
          className={`rounded px-3 py-1 text-sm font-medium ${n === currentPage
            ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
          aria-current={n === currentPage ? "page" : undefined}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded px-2 py-1 text-sm text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
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
              className={`text-3xl font-bold mt-2 ${color || "text-gray-900 dark:text-gray-100"
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