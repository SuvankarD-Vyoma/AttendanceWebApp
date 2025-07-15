"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Search, Mail, Phone, Calendar, User, Building2, Filter, Download, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getEmployeeList, getUserDetailsByUserID } from "./api";
import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Type definitions for better type safety
type Employee = {
  id?: string | number;
  user_id?: string | number;
  employee_name?: string;
  avatar?: string;
  email_id?: string;
  department_name?: string;
  position?: string;
  designation_name?: string;
  contact_number?: string;
  contact_no?: string;
  status?: string;
};

type UserDetails = {
  [key: string]: any;
  employee_image?: string;
  user_full_name?: string;
  designation?: string;
  emp_organization?: string;
};

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can adjust this as needed

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const admin_emp_id = (getCookie("userId") as string) || "";
        const decoded = decodeURIComponent(admin_emp_id);
        const response = await getEmployeeList(decoded);
        const data = response.data ?? [];
        setEmployees(data);
        setFilteredEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Search functionality
  useEffect(() => {
    const filtered = (employees || []).filter(employee =>
      (employee.employee_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (employee.email_id?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (employee.department_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (employee.position?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (employee.designation_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  const handleAddEmployeeButton = () => {
    router.push('/employees/add-employee');
  };

  const handleView = async (employee: Employee) => {
    setModalOpen(true);
    setSelectedEmployee(employee);
    setLoadingDetails(true);
    setUserDetails(null);
    try {
      const userId = String(employee.user_id ?? "");
      const res = await getUserDetailsByUserID(userId);
      setUserDetails(res.data);
    } catch (err) {
      setUserDetails(null);
    }
    setLoadingDetails(false);
  };

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  // PATCHED getStatusColor function for better dark mode contrast
  const getStatusColor = (status: string = "") => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'inactive':
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0 gap-4">
          <div className="space-y-2">
            {/* PATCHED: Gradient text for h1 */}
            <h1 className="text-4xl font-bold tracking-tight text-blue-950 dark:text-white bg-clip-text text-transparent">
              Employee Directory
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Manage your organization's workforce with ease
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              {/* PATCHED: Solid input backgrounds */}
              <Input
                type="search"
                placeholder="Search employees, departments, positions..."
                className="pl-10 w-full sm:w-80 h-11 border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleAddEmployeeButton} className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        {/* Employee Table */}
        {/* PATCHED: Card and CardHeader solid backgrounds */}
        <Card className="border-0 shadow-2xl bg-white dark:bg-slate-900 dark:border-slate-800 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-200/50 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                Employee Directory
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-slate-200/60 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all duration-200">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="border-slate-200/60 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all duration-200">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-200/30 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-6 px-6 text-sm tracking-wide">
                      Employee
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-6 px-4 text-sm tracking-wide">
                      Position
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-6 px-4 text-sm tracking-wide">
                      Contact
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-6 px-4 text-sm tracking-wide">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 py-6 px-6 text-right text-sm tracking-wide">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(currentEmployees || []).map((employee, index) => (
                    // PATCHED: Table row hover effect to solid color
                    <TableRow
                      key={employee.id || index}
                      className="border-b border-slate-100 dark:border-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <TableCell className="py-6 px-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-100 shadow-lg ring-2 ring-blue-100 dark:ring-slate-600 transition-all duration-300">
                              <AvatarImage src={employee.avatar} alt={employee.employee_name || ""} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
                                {(() => {
                                  const name = employee.employee_name || "";
                                  const parts = name.trim().split(" ");
                                  if (parts.length === 1) {
                                    return parts[0][0] || "";
                                  }
                                  return (parts[0][0] || "") + (parts[parts.length - 1][0] || "");
                                })()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 transition-colors duration-200">
                              {employee.employee_name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <div className="h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Mail className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
                              </div>
                              {employee.email_id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-4">
                        <div className="flex min-w-[160px] items-center gap-2">
                          <span className="text-xs font-medium text-slate-900 dark:text-slate-100 transition-colors duration-200">
                            {employee.position}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                            <Phone className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-400 transition-colors duration-200">
                            {employee.contact_number || employee.contact_no || "--"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-4">
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(employee.status || 'active')} border-0 font-medium px-3 py-1.5 rounded-full shadow-sm`}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-current animate-pulse"></div>
                            {employee.status || 'Active'}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="py-6 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all duration-200"
                            >
                              <MoreHorizontal className="h-4 w-4 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          {/* PATCHED: DropdownMenuContent backgrounds */}
                          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-xl rounded-xl">
                            <DropdownMenuItem onClick={() => handleView(employee)} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg m-1">
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg m-1">
                              Edit Employee
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg m-1">
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {(filteredEmployees?.length || 0) === 0 && (
              <div className="text-center py-16 px-4">
                <div className="relative inline-flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <User className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg animate-bounce"></div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No employees found
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  {searchQuery ? "Try adjusting your search terms or filters to find what you're looking for" : "Start building your team by adding your first employee"}
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Employee
                </Button>
              </div>
            )}

            {filteredEmployees.length > 0 && (
              <div className="py-4 px-6 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} records
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                          className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page =>
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        )
                        .map((page) => (
                          <PaginationItem key={page}>
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
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
                          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
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

        {/* Enhanced Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          {/* PATCHED: DialogContent backgrounds */}
          <DialogContent
            className="max-w-3xl max-h-[90vh] w-full bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-2xl rounded-2xl overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-700 dark:from-slate-100 dark:to-blue-300 bg-clip-text text-transparent">
                Employee Details
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Complete information about the selected employee
              </DialogDescription>
            </DialogHeader>
            {loadingDetails ? (
              <div className="p-8 text-center">Loading...</div>
            ) : userDetails ? (
              <div className="space-y-6">
                {/* PATCHED: Modal header background */}
                <div className="flex items-center gap-4 p-6 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/40 dark:border-slate-700/40">
                  <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-700 shadow-xl ring-4 ring-blue-100 dark:ring-slate-600">
                    <AvatarImage src={userDetails.employee_image} alt={userDetails.user_full_name || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-2xl">
                      {(() => {
                        const name = userDetails.user_full_name || "";
                        const parts = name.trim().split(" ");
                        if (parts.length === 1) {
                          return parts[0][0] || "";
                        }
                        return (parts[0][0] || "") + (parts[parts.length - 1][0] || "");
                      })()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {userDetails.user_full_name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-base mb-1">
                      {userDetails.designation}
                    </p>
                    <Badge
                      variant="outline"
                      className="border-0 font-medium px-3 rounded-full shadow-sm"
                    >
                      <div className="flex text-xs items-center">
                        {userDetails.emp_organization}
                      </div>
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <>
                    {Object.entries(userDetails)
                      .filter(([key]) =>
                        !["user_id", "employee_id", "org_id", "employee_image", "user_full_name", "designation", "emp_organization"].includes(key)
                      )
                      // PATCHED: Details grid items background
                      .map(([key, value]) => (
                        <div key={key} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg transition-all duration-200">
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
                            {key.replace(/_/g, " ")}
                          </p>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {value !== null && value !== undefined && value !== "" ? String(value) : <span className="text-slate-400">--</span>}
                          </p>
                        </div>
                      ))}
                  </>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-red-500">Failed to load details.</div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}