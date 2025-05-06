"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, ArrowUpDown, ExternalLink, Clock, Calendar } from "lucide-react";
import { getEmployeesByStatus, getAttendanceByDate, getEmployeeById } from "@/lib/data";
import { EmployeeStatus, EmployeeWithAttendance, AttendanceRecord } from "@/lib/types";
import { format } from "date-fns";
import { EmployeeLocationMap } from "@/components/attendance/employee-location-map";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

interface AttendanceTableProps {
  status: EmployeeStatus | "all";
}

export default function AttendanceTable({ status }: AttendanceTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceRecord | null>(null);
  
  let employees: EmployeeWithAttendance[] = [];
  
  if (status === "all") {
    const allAttendance = getAttendanceByDate();
    employees = allAttendance.map((record) => {
      const employee = getEmployeeById(record.employeeId);
      return {
        ...employee!,
        attendance: record,
      };
    });
  } else {
    employees = getEmployeesByStatus(status);
  }
  
  const sortedEmployees = [...employees].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortColumn) {
      case "name":
        valueA = a.name;
        valueB = b.name;
        break;
      case "department":
        valueA = a.department;
        valueB = b.department;
        break;
      case "checkInTime":
        valueA = a.attendance.checkInTime || "";
        valueB = b.attendance.checkInTime || "";
        break;
      default:
        valueA = a.name;
        valueB = b.name;
    }
    
    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  const handleOpenMap = (attendance: AttendanceRecord) => {
    setSelectedAttendance(attendance);
    setMapOpen(true);
  };
  
  const renderStatus = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.PRESENT:
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Present</Badge>;
      case EmployeeStatus.ABSENT:
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Absent</Badge>;
      case EmployeeStatus.ON_LEAVE:
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">On Leave</Badge>;
      case EmployeeStatus.LATE:
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Late</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <>
      <Card className="overflow-hidden border-none shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold">Employee</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("department")} className="p-0 h-auto font-semibold">
                    Department
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("checkInTime")} className="p-0 h-auto font-semibold">
                    Check In/Out
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Map</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                sortedEmployees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                          <AvatarImage src={employee.avatar} alt={employee.name} />
                          <AvatarFallback className="bg-primary/10">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{employee.name}</div>
                          <div className="text-xs text-muted-foreground">{employee.position}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      {employee.attendance.checkInTime ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Clock className="h-3.5 w-3.5 text-green-600" />
                            <span>In: {employee.attendance.checkInTime}</span>
                          </div>
                          {employee.attendance.checkOutTime && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>Out: {employee.attendance.checkOutTime}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{renderStatus(employee.attendance.status)}</TableCell>
                    <TableCell>
                      {employee.attendance.checkInLocation ? (
                        <div className="text-sm">
                          <div>Lat: {employee.attendance.checkInLocation.lat.toFixed(4)}</div>
                          <div>Long: {employee.attendance.checkInLocation.lng.toFixed(4)}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.attendance.checkInLocation ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenMap(employee.attendance)}
                          className="gap-1.5 h-8"
                        >
                          <MapPin className="h-4 w-4" />
                          View
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem>
                            <Calendar className="h-4 w-4 mr-2" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="sm:max-w-[600px] h-[500px]">
          <DialogHeader>
            <DialogTitle>Employee Check-in Location</DialogTitle>
          </DialogHeader>
          {selectedAttendance && selectedAttendance.checkInLocation && (
            <div className="h-[400px]">
              <EmployeeLocationMap 
                location={selectedAttendance.checkInLocation} 
                employeeName={getEmployeeById(selectedAttendance.employeeId)?.name || "Employee"}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}