"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, FileSpreadsheet, Users, Clock, Filter, ChevronRight } from "lucide-react";

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Helper to trigger download from blob
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  };

  // Download Attendance Report
  const handleDownloadAttendance = async () => {
    setDownloading("attendance");
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Replace with your actual API endpoint for attendance report
      const apiUrl = process.env.NEXT_PUBLIC_API_URL + "attendance/download-report";
      const token = ""; // Optionally get token from cookies if needed
        console.log("fasdfasrf")
      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          // "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to download attendance report");

      const blob = await res.blob();
      downloadBlob(blob, `attendance_report_${startDate || 'all'}_${endDate || 'all'}.xlsx`);
    } catch (err) {
      alert("Error downloading attendance report");
    } finally {
      setDownloading(null);
    }
  };

  // Download Leave Report
  const handleDownloadLeave = async () => {
    setDownloading("leave");
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Replace with your actual API endpoint for leave report
      const apiUrl = process.env.NEXT_PUBLIC_API_URL + "leave/download-report";
      const token = ""; // Optionally get token from cookies if needed

      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          // "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to download leave report");

      const blob = await res.blob();
      downloadBlob(blob, `leave_report_${startDate || 'all'}_${endDate || 'all'}.xlsx`);
    } catch (err) {
      alert("Error downloading leave report");
    } finally {
      setDownloading(null);
    }
  };

  const isDateRangeSelected = startDate && endDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4 dark:bg-blue-900 dark:text-blue-200">
            <FileSpreadsheet className="w-4 h-4" />
            Reports & Analytics
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 dark:text-gray-100">
            Download Reports
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            Generate and download comprehensive reports for attendance tracking and leave management. 
            Filter by date range to get exactly the data you need.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Date Filter Card */}
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl dark:text-gray-100">
                <Filter className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                Date Range Filter
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1 dark:text-gray-300">
                Select a date range to filter your reports, or leave blank to download all available data.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="start-date">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 dark:bg-slate-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="end-date">
                    <Calendar className="w-4 h-4" />
                    End Date
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 dark:bg-slate-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>
              </div>
              {isDateRangeSelected && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-950 dark:border-blue-900">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Selected Range:</strong> {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Report Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-[1.02] dark:bg-slate-900/80">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors duration-300 dark:bg-green-900 dark:group-hover:bg-green-800">
                      <Users className="w-8 h-8 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1 dark:text-gray-100">Attendance Report</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Daily attendance tracking and statistics</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800">
                    Excel Format
                  </Badge>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full dark:bg-green-400"></div>
                    Employee check-in/out times
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full dark:bg-green-400"></div>
                    Working hours calculation
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full dark:bg-green-400"></div>
                    Overtime tracking
                  </div>
                </div>

                <Button
                  onClick={handleDownloadAttendance}
                  disabled={downloading === "attendance"}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-base font-medium transition-all duration-200 group-hover:shadow-lg dark:bg-green-700 dark:hover:bg-green-800"
                  size="lg"
                >
                  {downloading === "attendance" ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download Attendance Report
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Leave Report Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-[1.02] dark:bg-slate-900/80">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-300 dark:bg-blue-900 dark:group-hover:bg-blue-800">
                      <Clock className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1 dark:text-gray-100">Leave Report</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Leave requests and balance tracking</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800">
                    Excel Format
                  </Badge>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full dark:bg-blue-400"></div>
                    Leave application details
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full dark:bg-blue-400"></div>
                    Approval status tracking
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full dark:bg-blue-400"></div>
                    Leave balance summary
                  </div>
                </div>
                <Button
                  onClick={handleDownloadLeave}
                  disabled={downloading === "leave"}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-medium transition-all duration-200 group-hover:shadow-lg dark:bg-blue-700 dark:hover:bg-blue-800"
                  size="lg"
                >
                  {downloading === "leave" ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download Leave Report
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="mt-8 border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 dark:text-gray-100">Report Information</h4>
                  <ul className="text-sm text-gray-600 space-y-1 dark:text-gray-300">
                    <li>• Reports are generated in Excel format for easy analysis</li>
                    <li>• Date filtering is optional - leave blank to download all available data</li>
                    <li>• All reports include detailed timestamps and employee information</li>
                    <li>• Download may take a few moments for large datasets</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}