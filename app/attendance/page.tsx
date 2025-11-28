"use client";

import React, { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { format } from "date-fns";
import { MapPin, ArrowUpDown, ExternalLink, Clock, Calendar, User, Search, Filter, ChevronDown } from "lucide-react";

// UI Components from "@/components/ui/*"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import moment from "moment";
import { EmployeeLocationMap } from "@/components/attendance/employee-location-map";
import * as XLSX from "xlsx";

// Correct API and Types
import { getAdminAttendanceInfo } from "@/app/attendance/api";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Extended interface to include date_wise_status for showing as per API
interface DateWiseStatus {
  attendance_date: string;
  status: string;
  entry_time: string | null;
  exit_time: string | null;
  late_remark: string | null;
}

interface AttendanceRecord {
  emp_id: string;
  employee_code: string | null;
  employee_name: string | null;
  employee_contact_no: string | null;
  employee_email: string | null;
  attendance_date: string | null;
  designation: string | null;
  checkin_time: string | null;
  checkout_time: string | null;
  checkin_latitude: string | null;
  checkin_longitude: string | null;
  checkout_latitude: string | null;
  checkout_longitude: string | null;
  duration: string | null;
  attendance_status: string | null;
  // Now add the date_wise_status (optional for backward compatibility)
  date_wise_status?: DateWiseStatus[];
  // We assume late_remark can be on the main record as well - reflect here:
  late_remark?: string | null;
}

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for sorting and map
  const [sortColumn, setSortColumn] = useState<string>("employee_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1)
  const today = new Date();
  const [startDate, setStartDate] = useState(format(today, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));
  const [search, setSearch] = useState("");
  const itemsPerPage = 10;

  // For each expanded employee, store which "parent" rows are expanded; key is index in currentItems or row.emp_id
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    //scroll to top of the page
    const tableElement = document.querySelector('.attendance-table');
    if (tableElement) {
      tableElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }

  // Convert yyyy-MM-dd to dd-MM-yyyy for API
  const toApiDate = (dateStr: string): string => {
    const [yyyy, mm, dd] = dateStr.split("-");
    return `${dd}-${mm}-${yyyy}`;
  };

  // Fetch ALL pages of attendance data and combine results
  useEffect(() => {
    const fetchAllAttendanceData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from cookies
        const token = (getCookie("token") as string) || "";
        // Get admin_Id from cookies
        const admin_Id = (getCookie("admin_Id") as string) || "";
        const decoded = decodeURIComponent(admin_Id);

        // We'll page through all page numbers until no more data is returned
        const page_size = 100; // Pull a large chunk for fewer calls
        let page_no = 1; // Start from 1, as some APIs start at 1, adjust to 0 if needed
        let allResults: AttendanceRecord[] = [];
        let keepGoing = true;

        while (keepGoing) {
          const res = await getAdminAttendanceInfo({
            token,
            admin_id: decoded,
            from_date: toApiDate(startDate),
            to_date: toApiDate(endDate),
            page_no,
            page_size,
          });

          // Defensive parse for different shapes (for true robustness)
          let records: AttendanceRecord[] = [];
          if (res && res.status === 0) {
            if (Array.isArray(res.data)) {
              records = res.data;
            } else if (Array.isArray(res.data?.attendance_list)) {
              records = res.data.attendance_list;
            } else if (Array.isArray(res.data?.data)) {
              records = res.data.data;
            }
            // else maybe empty, leave as empty array
          } else {
            // If first page is error, fail and report error. Subsequent incomplete stops collecting more.
            if (page_no === 1) setError(res?.error || "Failed to fetch attendance data");
            break;
          }

          allResults = allResults.concat(records);
          // If the returned data length is less than page_size, assume last page.
          if (!records.length || records.length < page_size) {
            keepGoing = false;
          } else {
            page_no += 1;
          }
        }

        // Optionally, de-duplicate if necessary, or further filter/group
        const filteredData = allResults.filter((record: AttendanceRecord) => {
          // Keep records that have either employee name or at least check-in time
          return record.employee_name || record.checkin_time;
        });

        setAttendanceData(filteredData);
      } catch (err: any) {
        setError("Error fetching attendance data");
        console.error("Attendance fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllAttendanceData();
  }, [startDate, endDate]);

  const sortedData = [...attendanceData].filter((row) => {
    const searchLower = search.toLowerCase();
    const nameMatch = row.employee_name?.toLowerCase().includes(searchLower);
    const codeMatch = row.employee_code?.toLowerCase().includes(searchLower);
    const statusMatch = row.attendance_status?.toLowerCase().includes(searchLower);
    return nameMatch || codeMatch || statusMatch;
  }).sort((a, b) => {
    let aValue: any = a[sortColumn as keyof AttendanceRecord] || '';
    let bValue: any = b[sortColumn as keyof AttendanceRecord] || '';

    // Special handling for dates
    if (sortColumn === 'attendance_date') {
      const [aDay, aMonth, aYear] = (aValue || '').split('-');
      const [bDay, bMonth, bYear] = (bValue || '').split('-');
      aValue = aDay && aMonth && aYear ? new Date(+aYear, +aMonth - 1, +aDay) : new Date(0);
      bValue = bDay && bMonth && bYear ? new Date(+bYear, +bMonth - 1, +bDay) : new Date(0);
    }

    // Special handling for status
    if (sortColumn === 'status') {
      const statusOrder = {
        'Present': 3,
        'Late': 2,
        'Absent': 1
      };
      aValue = statusOrder[a.attendance_status as keyof typeof statusOrder] || 0;
      bValue = statusOrder[b.attendance_status as keyof typeof statusOrder] || 0;
    }
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Then update the pagination calculations to use sortedData instead of attendanceData
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedData.slice(startIndex, endIndex);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // If clicking the same column, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new column, set it and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const handleOpenMap = (attendance: AttendanceRecord) => {
    setSelectedAttendance(attendance);
    setMapOpen(true);
  };

  const renderStatus = (row: AttendanceRecord) => {
    if (row.checkin_time && row.checkout_time) {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
          Present
        </Badge>
      );
    } else if (row.checkin_time && !row.checkout_time) {
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
          <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
          Late
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
          Absent
        </Badge>
      );
    }
  };

  const getEmployeeInitials = (name: string | null) => {
    if (!name) return "??";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatLocation = (lat: string | null, lng: string | null) => {
    if (!lat || !lng) return null;
    return {
      lat: parseFloat(lat).toFixed(4),
      lng: parseFloat(lng).toFixed(4)
    };
  };

  const handleExportExcel = () => {
    // Group data by employee name and collect all their date records
    const groupedData: { [key: string]: { name: string; dates: { [date: string]: { entry: string; exit: string } } } } = {};

    sortedData.forEach(row => {
      const empName = row.employee_name || 'Unknown Employee';

      if (!groupedData[empName]) {
        groupedData[empName] = {
          name: empName,
          dates: {}
        };
      }

      // Check if date_wise_status exists and has data
      if (row.date_wise_status && row.date_wise_status.length > 0) {
        row.date_wise_status.forEach(dws => {
          const dateKey = moment(dws.attendance_date).format("DD-MM-YYYY");
          groupedData[empName].dates[dateKey] = {
            entry: dws.entry_time || "",
            exit: dws.exit_time || ""
          };
        });
      } else {
        // If no date_wise_status, use the main record data
        const dateKey = row.attendance_date ? moment(row.attendance_date).format("DD-MM-YYYY") : "";
        if (dateKey) {
          groupedData[empName].dates[dateKey] = {
            entry: row.checkin_time || "",
            exit: row.checkout_time || ""
          };
        }
      }
    });

    // Get all unique dates across all employees and sort them
    const allDates = new Set<string>();
    Object.values(groupedData).forEach(emp => {
      Object.keys(emp.dates).forEach(date => allDates.add(date));
    });
    const sortedDates = Array.from(allDates).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('-').map(Number);
      const [dayB, monthB, yearB] = b.split('-').map(Number);
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA.getTime() - dateB.getTime();
    });

    // Create export data with dynamic columns for each date
    const exportData: any[] = [];

    Object.values(groupedData).forEach(emp => {
      const rowData: any = {
        "Name": emp.name
      };

      sortedDates.forEach(date => {
        if (emp.dates[date]) {
          rowData[`${date} - Entry`] = emp.dates[date].entry;
          rowData[`${date} - Exit`] = emp.dates[date].exit;
        } else {
          rowData[`${date} - Entry`] = "";
          rowData[`${date} - Exit`] = "";
        }
      });

      exportData.push(rowData);
    });

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    // Trigger download
    XLSX.writeFile(workbook, `attendance_report_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
  };

  const toggleRowExpanded = (key: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Attendance</h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              View and manage employee attendance records
            </p>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm dark:bg-gray-950/80">
          <CardContent className="p-4 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
              {/* Search */}
              <div className="space-y-2 col-span-1 xl:col-span-2">
                <Label htmlFor="search" className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <div className="p-1 bg-blue-50 rounded-md dark:bg-blue-900/30">
                    <Search className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Search Employee
                </Label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                    <Search className="h-4 w-4 text-gray-400 transition-colors duration-200" />
                  </div>
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by employee name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-10 w-full h-10 text-sm bg-white/95 border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200 placeholder:text-gray-400 shadow-sm hover:shadow-md focus:shadow-md dark:bg-gray-950/95 dark:border-gray-700 dark:hover:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-all duration-150"
                      title="Clear search"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {/* Search results count indicator */}
                  {search && (
                    <div className="absolute -bottom-6 left-0 text-xs text-gray-500 dark:text-gray-400">
                      {sortedData.length} result{sortedData.length !== 1 ? 's' : ''} found
                    </div>
                  )}
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  End Date
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm dark:bg-gray-950/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Attendance Records
                <Badge variant="secondary" className="ml-2 text-xs">
                  {sortedData.length} records
                </Badge>
              </CardTitle>
              <Button
                onClick={handleExportExcel}
                variant="secondary"
                className="gap-2 h-8 px-3 bg-gray-100 border border-gray-400 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="text-xs font-medium">Export to Excel</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden rounded-lg border border-gray-200/60 dark:border-gray-800/60">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 h-12">
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-3 px-4 w-10 text-center">
                        #
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-3 px-4">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("employee_name")}
                          className="p-0 h-auto font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Employee
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-3 px-4">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("attendance_date")}
                          className="p-0 h-auto font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          Attendance Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-3 px-4">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("checkin_time")}
                          className="p-0 h-auto font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Check In/Out
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-3 px-4">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("duration")}
                          className="p-0 h-auto font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          Duration
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-3 px-4">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("status")}
                          className="p-0 h-auto font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          Status
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      {/* <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-3 px-4">
                        Late Remark
                      </TableHead> */}
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-3 px-4">Location</TableHead>
                      {/* date_wise_status Show/Hide button */}
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-3 px-4">
                        Date-wise Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <User className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                            <span className="text-lg font-medium">No attendance records found</span>
                            <span className="text-sm text-gray-400">Try adjusting your search or date range</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {currentItems.map((row, index) => {
                          const location = formatLocation(row.checkin_latitude, row.checkin_longitude);
                          // Calculate the row number across all pagination
                          const rowNumber = startIndex + index + 1;
                          // Use emp_id-index for key since an employee can be shown on multiple pages with same emp_id if API allows
                          const expandKey = `${row.emp_id}-${index}`;

                          return (
                            <React.Fragment key={expandKey}>
                              <TableRow
                                className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-all duration-200 h-[100px]"
                              >
                                <TableCell className="py-3 px-4 text-center font-semibold text-gray-800 dark:text-gray-200">
                                  {rowNumber}
                                </TableCell>
                                <TableCell className="py-3 px-4 min-w-[120px] transition-all duration-200">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-md ring-2 ring-gray-100 dark:ring-gray-800 flex-shrink-0">
                                      <AvatarImage src={""} alt={row.employee_name || "Employee"} />
                                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                                        {(row.employee_name ?? "NA")
                                          .split(' ')
                                          .filter((word: string) => word.length > 0)
                                          .map((n: string) => n[0])
                                          .join('')
                                          .toUpperCase()
                                          .slice(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm break-words">
                                        {row.employee_name || "Unknown Employee"}
                                      </div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400 break-words">
                                        {row.designation || "No designation"}
                                      </div>
                                      {row.employee_code && (
                                        <div className="text-xs text-gray-500 dark:text-gray-500 font-mono break-words">
                                          {row.employee_code}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-3 px-4 min-w-[120px] transition-all duration-200">
                                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                    {toApiDate(row.attendance_date || "") || "--"}
                                  </div>
                                </TableCell>
                                <TableCell className="py-3 px-4 min-w-[120px] transition-all duration-200">
                                  <div className="space-y-1">
                                    {row.checkin_time ? (
                                      <div className="flex items-center gap-2 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                          In: {row.checkin_time}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                        <span>No check-in</span>
                                      </div>
                                    )}
                                    {row.checkout_time ? (
                                      <div className="flex items-center gap-2 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                          Out: {row.checkout_time}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                        <span>No check-out</span>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="py-3 px-4 min-w-[120px] transition-all duration-200">
                                  {row.duration ? (
                                    <div className="text-xs text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded font-medium">
                                      {row.duration}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 dark:text-gray-600">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-3 px-4 min-w-[120px] transition-all duration-200">
                                  {row.attendance_status === "Present" ? (
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                                      <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                                      Present
                                    </Badge>
                                  ) : row.attendance_status === "Late" ? (
                                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                                      <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                                      Late
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                                      Absent
                                    </Badge>
                                  )}
                                </TableCell>
                                {/* <TableCell className="py-3 px-4 min-w-[120px] transition-all duration-200">
                                  {row.late_remark
                                    ? <span className="text-xs text-gray-700 dark:text-gray-300">{row.late_remark}</span>
                                    : <span className="text-gray-400 dark:text-gray-600">—</span>
                                  }
                                </TableCell> */}
                                <TableCell className="py-3 px-4 min-w-[100px] transition-all duration-200">
                                  {location ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleOpenMap(row)}
                                      className="gap-2 h-8 px-3 border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800 transition-colors"
                                    >
                                      <MapPin className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                      <span className="text-xs font-medium">View</span>
                                    </Button>
                                  ) : (
                                    <span className="text-gray-400 dark:text-gray-600">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-3 px-4 transition-all duration-200 min-w-[100px]">
                                  {/* Show expand/collapse button if there is date_wise_status for this row */}
                                  {row.date_wise_status && row.date_wise_status.length > 0 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => toggleRowExpanded(expandKey)}
                                      aria-label={expandedRows[expandKey] ? "Hide date wise status" : "Show date wise status"}
                                      className={`transition-all duration-150 rounded-full ${expandedRows[expandKey] ? "bg-blue-100 dark:bg-blue-900/30" : ""}`}
                                    >
                                      <ChevronDown
                                        className={`h-5 w-5 text-blue-700 dark:text-blue-400 transition-transform ${expandedRows[expandKey] ? "rotate-180" : ""}`}
                                      />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>

                              {/* Expanded date_wise_status panel */}
                              {row.date_wise_status && row.date_wise_status.length > 0 && expandedRows[expandKey] && (
                                <TableRow className="bg-blue-50/30 dark:bg-blue-900/20">
                                  <TableCell colSpan={9} className="p-4 pt-2 pb-4 transition">
                                    <div>
                                      <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> All Dates Attendance Status
                                      </h4>
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-xs border rounded-lg">
                                          <thead>
                                            <tr className="bg-blue-100 dark:bg-blue-900">
                                              <th className="p-2 border text-left">Date</th>
                                              <th className="p-2 border text-left">Status</th>
                                              <th className="p-2 border text-left">Entry</th>
                                              <th className="p-2 border text-left">Exit</th>
                                              <th className="p-2 border text-left">Late Remark</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {row.date_wise_status.map((dws, i) => (
                                              <tr key={i} className="border-t even:bg-blue-50 dark:even:bg-blue-950/20">
                                                <td className="p-2 border">{moment(dws.attendance_date).format("dddd, DD-MM-YYYY")}</td>
                                                <td className="p-2 border">
                                                  {dws.status === "Present" && (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                                                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                      Present
                                                    </span>
                                                  )}
                                                  {dws.status === "Late" && (
                                                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                                                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                                      Late
                                                    </span>
                                                  )}
                                                  {dws.status !== "Present" && dws.status !== "Late" && (
                                                    <span className="inline-flex items-center gap-1 text-red-700 dark:text-red-400">
                                                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                      {dws.status}
                                                    </span>
                                                  )}
                                                </td>
                                                <td className="p-2 border">{dws.entry_time || <span className="text-gray-400">—</span>}</td>
                                                <td className="p-2 border">{dws.exit_time || <span className="text-gray-400">—</span>}</td>
                                                <td className="p-2 border">{dws.late_remark || <span className="text-gray-400">—</span>}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            {sortedData.length > 0 && (
              <div className="py-4 px-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} records
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        />
                      </PaginationItem>

                      {/* Add page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first page, last page, current page, and pages around current page
                          return page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1);
                        })
                        .map((page) => (
                          <PaginationItem key={page}>
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className={`w-8 h-8 ${currentPage === page
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                              {page}
                            </Button>
                          </PaginationItem>
                        ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>

      {/* Dialog for Map View */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="sm:max-w-[600px] h-[500px]">
          <DialogHeader>
            <DialogTitle>Employee Check-in Location</DialogTitle>
          </DialogHeader>
          {selectedAttendance && selectedAttendance.checkin_latitude && selectedAttendance.checkin_longitude && (
            <div className="h-[400px]">
              <EmployeeLocationMap
                location={{
                  lat: parseFloat(selectedAttendance.checkin_latitude),
                  lng: parseFloat(selectedAttendance.checkin_longitude),
                }}
                employeeName={selectedAttendance.employee_name || "Unknown Employee"}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}