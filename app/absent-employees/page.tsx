"use client";

import { UserX, Mail, Phone, Briefcase, Calendar, Search, Filter, Download } from 'lucide-react';
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
// Import the API (correct path)
import { getAbsentEmployeeList } from "@/app/absent-employees/api";

type AbsentEmployee = {
  emp_id: number;
  employee_name: string;
  department: string;
  designation: string;
  email_address: string;
  contact_number: string;
  leave_type_id: number;
  leave_type: string;
  leave_start_date: string;
  leave_end_date: string;
};

export default function AbsentEmployeesPage() {
  const [absentEmployees, setAbsentEmployees] = useState<AbsentEmployee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const admin_Id = String(getCookie("admin_Id") || "");
        const format = (d: Date) =>
          `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
        const today = new Date();
        const response = await getAbsentEmployeeList({
          admin_id: admin_Id,
          from_date: format(today),
          to_date: format(today),
        });
        // expects { data: [...] }
        if (response && Array.isArray(response.data)) {
          setAbsentEmployees(response.data);
        }
      } catch (e) {
        setAbsentEmployees([]);
      }
    }
    fetchData();
  }, []);

  const filteredEmployees = absentEmployees.filter(emp => {
    const matchesSearch =
      emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      filterDepartment === "all" || emp.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = [
    "all",
    ...Array.from(new Set(absentEmployees.map(e => e.department))),
  ];

  // Color by leave_type
  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType.toLowerCase()) {
      case "sick leave":
        return "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900";
      case "casual leave":
        return "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900";
      case "privilege leave":
        return "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-900";
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  // Leave date as range
  const getLeaveDateRange = (start: string, end: string) => {
    if (start === end) {
      return new Date(start).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    return (
      new Date(start).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }) +
      " - " +
      new Date(end).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
                Absent Employees
              </h1>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-all duration-200 flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, department, or designation..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <select
                value={filterDepartment}
                onChange={e => setFilterDepartment(e.target.value)}
                className="pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 text-slate-900 dark:text-slate-100 transition-all appearance-none cursor-pointer"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === "all" ? "All Departments" : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Leave Dates
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {filteredEmployees.map((employee, index) => (
                  <tr
                    key={employee.emp_id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 dark:from-blue-500 dark:via-blue-600 dark:to-blue-700 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-base">
                              {employee.employee_name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {employee.employee_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg mr-2">
                          <Briefcase className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        {employee.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {employee.designation}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1.5">
                        <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <Mail className="w-3.5 h-3.5 mr-2 text-slate-400 dark:text-slate-500" />
                          {employee.email_address}
                        </div>
                        <div className="flex items-center text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <Phone className="w-3.5 h-3.5 mr-2 text-slate-400 dark:text-slate-500" />
                          {employee.contact_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${getLeaveTypeColor(
                          employee.leave_type
                        )}`}
                      >
                        <UserX className="w-3 h-3 mr-1.5" />
                        {employee.leave_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block rounded-md bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {getLeaveDateRange(
                          employee.leave_start_date,
                          employee.leave_end_date
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                          <UserX className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-1">
                          No absent employees found
                        </p>
                        <p className="text-slate-500 dark:text-slate-500 text-sm">
                          {searchTerm || filterDepartment !== "all"
                            ? "Try adjusting your search or filters"
                            : "All employees are present today"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        {filteredEmployees.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <Calendar className="w-4 h-4" />
              </div>
              <span>
                Showing{" "}
                <strong className="text-slate-900 dark:text-slate-100">
                  {filteredEmployees.length}
                </strong>{" "}
                of{" "}
                <strong className="text-slate-900 dark:text-slate-100">
                  {absentEmployees.length}
                </strong>{" "}
                absent employees
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}