"use client";

import { UserX, Mail, Phone, Briefcase, Calendar, Search, Filter, Download, User } from 'lucide-react';
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { getCookie } from "cookies-next";

// Dummy data fallback for on leave employees
type OnLeaveEmployee = {
  id: string | number;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  reason: string;
};

// Example fallback, replace this API call with real data fetch when backend ready
const fetchOnLeaveEmployees = async (): Promise<OnLeaveEmployee[]> => {
  // Simulate API delay & demo data. Replace with fetch to your API when ready.
  return [
    {
      id: 1,
      name: "John Doe",
      department: "Engineering",
      position: "Software Engineer",
      email: "john.doe@example.com",
      phone: "555-1234",
      reason: "Sick Leave",
    },
    {
      id: 2,
      name: "Jane Smith",
      department: "Marketing",
      position: "Marketing Manager",
      email: "jane.smith@example.com",
      phone: "555-5678",
      reason: "Vacation",
    },
    {
      id: 3,
      name: "Mike Johnson",
      department: "Sales",
      position: "Sales Representative",
      email: "mike.j@example.com",
      phone: "555-9012",
      reason: "Personal Leave",
    },
    {
      id: 4,
      name: "Sarah Williams",
      department: "HR",
      position: "HR Specialist",
      email: "sarah.w@example.com",
      phone: "555-3456",
      reason: "Sick Leave",
    }
  ];
};

export default function AbsentEmployeesPage() {
  const [absentEmployees, setAbsentEmployees] = useState<OnLeaveEmployee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getCookie("token") || "";
    const admin_emp_id = getCookie("userId") || "";
    const decoded = decodeURIComponent(admin_emp_id);

    // Fetch absent employees from API (replace implementation as needed)
    setIsLoading(true);
    fetchOnLeaveEmployees().then((data) => {
      setAbsentEmployees(data);
      setIsLoading(false);
    });
  }, []);

  const filteredEmployees = absentEmployees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || emp.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = ["all", ...Array.from(new Set(absentEmployees.map(emp => emp.department)))];

  const getReasonColor = (reason: string) => {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes("sick")) return "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50";
    if (lowerReason.includes("vacation")) return "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50";
    return "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2">
                On Leave Employees
              </h1>
              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            {/* Stats Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 px-6 py-4 backdrop-blur-sm">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Absent</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{absentEmployees.length}</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6 animate-in fade-in slide-in-from-top duration-700">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, department, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Department Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-slate-100 appearance-none cursor-pointer transition-all min-w-[180px]"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === "all" ? "All Departments" : dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Button */}
              <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom duration-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 dark:text-slate-400">Loading employees...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <User className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400 text-lg">
                          {searchTerm || selectedDepartment !== "all" 
                            ? "No employees match your search criteria" 
                            : "No absent employees for today"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee, index) => (
                    <tr 
                      key={employee.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 relative">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 dark:from-blue-500 dark:via-blue-600 dark:to-blue-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow ring-2 ring-white dark:ring-slate-800">
                              <span className="text-white font-bold text-base">
                                {employee.name.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {employee.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                          <Briefcase className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500" />
                          {employee.department}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600 dark:text-slate-400">{employee.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1.5">
                          <a 
                            href={`mailto:${employee.email}`}
                            className="flex items-center text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 mr-2 text-slate-400 dark:text-slate-500" />
                            {employee.email}
                          </a>
                          <a 
                            href={`tel:${employee.phone}`}
                            className="flex items-center text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 mr-2 text-slate-400 dark:text-slate-500" />
                            {employee.phone}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getReasonColor(employee.reason)} shadow-sm`}>
                          <User className="w-3.5 h-3.5 mr-1.5" />
                          {employee.reason}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Stats */}
        {!isLoading && filteredEmployees.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 animate-in fade-in duration-1000">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className="text-slate-900 dark:text-slate-100">{filteredEmployees.length}</strong> of{' '}
                <strong className="text-slate-900 dark:text-slate-100">{absentEmployees.length}</strong> employees
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}