// Types for the attendance system

export enum EmployeeStatus {
  PRESENT = "present",
  ABSENT = "absent",
  ON_LEAVE = "on_leave",
  LATE = "late",
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  joinDate: string;
  avatar?: string;
  contactNumber: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: EmployeeStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInLocation: Location | null;
  checkOutLocation: Location | null;
  leaveType?: string;
  leaveReason?: string;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  type: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
}

export interface EmployeeWithAttendance extends Employee {
  attendance: AttendanceRecord;
}

export interface DashboardStats {
  presentCount: number;
  absentCount: number;
  onLeaveCount: number;
  totalEmployees: number;
  attendanceRate: number;
}