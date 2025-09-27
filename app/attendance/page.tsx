"use client";

import React, { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { format } from "date-fns";
import { MapPin, ArrowUpDown, ExternalLink, Clock, Calendar, User, Search, Filter } from "lucide-react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Custom Components
import AttendanceFilters from "@/components/attendance/attendance-filters";
import { EmployeeLocationMap } from "@/components/attendance/employee-location-map";
import * as XLSX from "xlsx";

// API and Types
import { getAdminAttendanceInfo } from "@/app/attendance/api";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        setError(null);

        const admin_emp_id = (getCookie("userId") as string) || "";
        const decoded = decodeURIComponent(admin_emp_id);

        const response = await getAdminAttendanceInfo(
          decoded,
          toApiDate(startDate),
          toApiDate(endDate)
        );

        if (response.status === 0 && response.data) {
          // Filter out records with insufficient data and group by employee
          const filteredData = response.data.filter((record: AttendanceRecord) => {
            // Keep records that have either employee name or at least check-in time
            return record.employee_name || record.checkin_time;
          });

          // If you want to group by employee and show latest record per employee:
          const groupedData = filteredData.reduce((acc: { [key: string]: AttendanceRecord }, record: AttendanceRecord) => {
            const key = record.emp_id;
            if (!acc[key] || (record.checkin_time && record.checkin_time > (acc[key].checkin_time || ""))) {
              // Take the record with later check-in time or the one with complete employee info
              if (record.employee_name || !acc[key].employee_name) {
                acc[key] = record;
              }
            }
            return acc;
          }, {});

          setAttendanceData(Object.values(groupedData));
        } else {
          setError("Failed to fetch attendance data");
        }
      } catch (err) {
        setError("Error fetching attendance data");
        console.error("Attendance fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceData();
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
  const totalPages = Math.ceil(totalItems / itemsPerPage);
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
    // Transform data to exclude emp_id and rename headers
    const exportData = sortedData.map(row => {
      // Format date as "Day, DD-MM-YYYY"
      let dayAndDate = '';
      if (row.attendance_date) {
        const dateObj = new Date(row.attendance_date.split('-').reverse().join('-'));
        const day = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        dayAndDate = `${day}, ${row.attendance_date}`;
      }

      return {
        'Employee Name': row.employee_name || 'Unknown Employee',
        'Day and Date': moment(row.attendance_date).format("dddd, DD-MM-YYYY"),
        "Day & Date": (
          <>
            {moment(row.attendance_date).format("dddd, DD-MM-YYYY")} <br />
            Status: {row.attendance_status || ""} <br />
            Entry: {row.checkin_time || ""} <br />
            Exit: {row.checkout_time || ""}
          </>
        )
      };
    });

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    // Trigger download
    XLSX.writeFile(workbook, `attendance_report_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
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
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-3 px-4">Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-gray-500 dark:text-gray-400">
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

                          return (
                            <TableRow
                              key={`${row.emp_id}-${index}`}
                              className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-all duration-200 h-[100px]"
                            >
                              <TableCell className="py-3 px-4 min-w-[120px] transition-all duration-200">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10 border-2 border-white shadow-md ring-2 ring-gray-100 dark:ring-gray-800 flex-shrink-0">
                                    <AvatarImage src={""} alt={row.employee_name || "Employee"} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                                      {(row.employee_name ?? "NA")
                                        .split(' ')
                                        .filter((word: string) => word.length > 0) // Add type annotation
                                        .map((n: string) => n[0]) // Add type annotation
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
                            </TableRow>
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