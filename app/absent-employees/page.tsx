"use client";

import {
  UserX,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Search,
  Filter,
  Download,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { getAbsentEmployeeList } from "@/app/absent-employees/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

type AbsentEmployee = {
  emp_id: number;
  employee_name: string;
  department: string;
  designation: string;
  email_address: string;
  contact_number: string;
  leave_type_id: number | null;
  leave_type: string | null;
  leave_start_date: string;
  leave_end_date: string;
};

export default function AbsentEmployeesPage() {
  const [absentEmployees, setAbsentEmployees] = useState<AbsentEmployee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal
  const [selectedEmployee, setSelectedEmployee] =
    useState<AbsentEmployee | null>(null);

  // -----------------------------
  // Fetch Data
  // -----------------------------
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const admin_Id = String(getCookie("admin_Id") || "");
        const format = (d: Date) =>
          `${String(d.getDate()).padStart(2, "0")}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}-${d.getFullYear()}`;

        const today = new Date();

        const response = await getAbsentEmployeeList({
          admin_id: admin_Id,
          from_date: format(today),
          to_date: format(today),
        });

        if (response && Array.isArray(response.data)) {
          setAbsentEmployees(response.data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // -----------------------------
  // Filtering
  // -----------------------------
  const filteredEmployees = absentEmployees.filter((emp) => {
    const safeName = emp.employee_name?.toLowerCase() || "";
    const safeDept = emp.department?.toLowerCase() || "";
    const safeDesignation = emp.designation?.toLowerCase() || "";

    const query = searchTerm.toLowerCase();

    const matchesSearch =
      safeName.includes(query) ||
      safeDept.includes(query) ||
      safeDesignation.includes(query);

    const matchesDepartment =
      filterDepartment === "all" || emp.department === filterDepartment;

    return matchesSearch && matchesDepartment;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedData = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // -----------------------------
  // UI Helpers
  // -----------------------------
  const departments = [
    "all",
    ...Array.from(new Set(absentEmployees.map((e) => e.department))),
  ];

  const getLeaveTypeColor = (leaveType: string | null) => {
    const type = leaveType?.toLowerCase() || "";
    switch (type) {
      case "sick leave":
        return "bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200";
      case "casual leave":
        return "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200";
      case "privilege leave":
        return "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200";
      default:
        return "bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 border border-slate-200";
    }
  };

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

  // -----------------------------
  // EXPORT: Excel
  // -----------------------------
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredEmployees);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absent Employees");
    XLSX.writeFile(wb, "Absent_Employees.xlsx");
  };

  // -----------------------------
  // EXPORT: PDF
  // -----------------------------
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.text("Absent Employees", 14, 15);

    const rows = filteredEmployees.map((e) => [
      e.employee_name,
      e.department,
      e.designation,
      e.email_address,
      e.contact_number,
      e.leave_type,
      getLeaveDateRange(e.leave_start_date, e.leave_end_date),
    ]);

    (doc as any).autoTable({
      head: [
        [
          "Name",
          "Department",
          "Designation",
          "Email",
          "Phone",
          "Leave Type",
          "Dates",
        ],
      ],
      body: rows,
      startY: 22,
    });

    doc.save("Absent_Employees.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6">
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.15);
        }
        
        .btn-hover {
          transition: all 0.2s ease;
        }
        
        .btn-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .btn-hover:active {
          transform: translateY(0);
        }
        
        .table-row {
          transition: all 0.2s ease;
        }
        
        .table-row:hover {
          background: linear-gradient(to right, #f8fafc, #ffffff);
          transform: scale(1.002);
        }
        
        .modal-backdrop {
          animation: fadeIn 0.2s ease-out;
        }
        
        .modal-content {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* ---------------- HEADER ---------------- */}
        <div className="flex justify-between items-center mb-8 animate-slide-up">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <UserX className="text-white" size={28} />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Absent Employees
              </h1>
            </div>
            <p className="text-slate-600 ml-16 flex items-center gap-2">
              <Calendar size={16} />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportToExcel}
              className="px-5 py-2.5 bg-white border-2 border-green-200 rounded-xl flex gap-2 items-center text-green-700 font-medium btn-hover hover:bg-green-50 hover:border-green-300"
            >
              <Download size={18} /> Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-5 py-2.5 bg-white border-2 border-red-200 rounded-xl flex gap-2 items-center text-red-700 font-medium btn-hover hover:bg-red-50 hover:border-red-300"
            >
              <Download size={18} /> PDF
            </button>
          </div>
        </div>

        {/* ---------------- Search & Filter ---------------- */}
        <div className="flex gap-4 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, department, designation..."
              className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-12 pr-10 py-3.5 border-2 border-slate-200 rounded-xl bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none font-medium min-w-[200px]"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "all" ? "All Departments" : dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ---------------- Skeleton Loader ---------------- */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 animate-fade-in">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-20 skeleton rounded-xl"
              />
            ))}
          </div>
        )}

        {/* ---------------- TABLE ---------------- */}
        {!loading && (
          <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
                <tr>
                  {[
                    "Employee",
                    "Department",
                    "Designation",
                    "Contact",
                    "Leave Type",
                    "Leave Dates",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((emp) => (
                  <tr key={emp.emp_id} className="border-b border-slate-100 table-row">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                          {emp.employee_name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800">
                          {emp.employee_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Briefcase size={16} className="text-slate-400" />
                        {emp.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{emp.designation}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <Mail size={14} className="text-slate-400" />
                        {emp.email_address}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        {emp.contact_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold inline-block ${getLeaveTypeColor(
                          emp.leave_type
                        )}`}
                      >
                        {emp.leave_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Calendar size={16} className="text-slate-400" />
                        {getLeaveDateRange(
                          emp.leave_start_date,
                          emp.leave_end_date
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedEmployee(emp)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg flex items-center gap-2 btn-hover font-medium shadow-md shadow-blue-200"
                      >
                        <Info size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))}

                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16">
                      <UserX size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 font-medium">No absent employees found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- Pagination ---------------- */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 animate-fade-in">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border-2 border-slate-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed btn-hover"
            >
              <ChevronLeft size={20} />
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                  currentPage === i + 1
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                    : "bg-white text-slate-700 border-slate-200 btn-hover hover:border-slate-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border-2 border-slate-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed btn-hover"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* ---------------- Modal ---------------- */}
        {selectedEmployee && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 modal-backdrop">
            <div className="bg-white p-8 rounded-2xl w-[500px] shadow-2xl relative modal-content border-2 border-slate-200">
              <button
                className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-lg transition-all"
                onClick={() => setSelectedEmployee(null)}
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {selectedEmployee.employee_name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {selectedEmployee.employee_name}
                  </h2>
                  <p className="text-slate-500">{selectedEmployee.designation}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Briefcase size={20} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Department</p>
                    <p className="font-semibold text-slate-800">{selectedEmployee.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Mail size={20} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Email</p>
                    <p className="font-semibold text-slate-800">{selectedEmployee.email_address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Phone size={20} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Contact</p>
                    <p className="font-semibold text-slate-800">{selectedEmployee.contact_number}</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                  <p className="text-xs text-blue-700 font-medium mb-2">Leave Information</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getLeaveTypeColor(selectedEmployee.leave_type)}`}>
                      {selectedEmployee.leave_type}
                    </span>
                    <span className="flex items-center gap-2 text-slate-700 font-medium">
                      <Calendar size={16} />
                      {getLeaveDateRange(selectedEmployee.leave_start_date, selectedEmployee.leave_end_date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}