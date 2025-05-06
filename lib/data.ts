// Mock data for the attendance tracking system
import { EmployeeStatus } from '@/lib/types';

// Mock the current date to ensure consistency in demo data
const TODAY = new Date();
const YESTERDAY = new Date(TODAY);
YESTERDAY.setDate(TODAY.getDate() - 1);

// Format dates consistently
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Mock employee data
export const employees = [
  {
    id: "emp001",
    name: "Anjali Patel",
    email: "anjali.p@vyomainnovus.com",
    department: "Engineering",
    position: "Software Engineer",
    joinDate: "2022-05-15",
    avatar: "https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=400",
    contactNumber: "+91 98765 43210",
  },
  {
    id: "emp002",
    name: "Rahul Singh",
    email: "rahul.s@vyomainnovus.com",
    department: "Product",
    position: "Product Manager",
    joinDate: "2021-11-10",
    avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
    contactNumber: "+91 87654 32109",
  },
  {
    id: "emp003",
    name: "Priya Sharma",
    email: "priya.s@vyomainnovus.com",
    department: "Marketing",
    position: "Marketing Specialist",
    joinDate: "2022-02-28",
    avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400",
    contactNumber: "+91 76543 21098",
  },
  {
    id: "emp004",
    name: "Arjun Reddy",
    email: "arjun.r@vyomainnovus.com",
    department: "Finance",
    position: "Financial Analyst",
    joinDate: "2021-07-22",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400",
    contactNumber: "+91 65432 10987",
  },
  {
    id: "emp005",
    name: "Divya Krishnan",
    email: "divya.k@vyomainnovus.com",
    department: "HR",
    position: "HR Manager",
    joinDate: "2020-10-05",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
    contactNumber: "+91 54321 09876",
  },
  {
    id: "emp006",
    name: "Vikram Malhotra",
    email: "vikram.m@vyomainnovus.com",
    department: "Engineering",
    position: "DevOps Engineer",
    joinDate: "2022-01-17",
    avatar: "https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?auto=compress&cs=tinysrgb&w=400",
    contactNumber: "+91 43210 98765",
  },
  {
    id: "emp007",
    name: "Meera Joshi",
    email: "meera.j@vyomainnovus.com",
    department: "Design",
    position: "UI/UX Designer",
    joinDate: "2021-09-13",
    avatar: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
    contactNumber: "+91 32109 87654",
  },
  {
    id: "emp008",
    name: "Karthik Nair",
    email: "karthik.n@vyomainnovus.com",
    department: "Sales",
    position: "Sales Representative",
    joinDate: "2022-04-02",
    avatar: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400",
    contactNumber: "+91 21098 76543",
  },
];

// Mock attendance data
export const attendanceData = [
  // Employees who are present today
  {
    id: "att001",
    employeeId: "emp001",
    date: formatDate(TODAY),
    status: EmployeeStatus.PRESENT,
    checkInTime: "09:05:22",
    checkOutTime: null,
    checkInLocation: { lat: 12.9716, lng: 77.5946 },
    checkOutLocation: null,
  },
  {
    id: "att002",
    employeeId: "emp002",
    date: formatDate(TODAY),
    status: EmployeeStatus.PRESENT,
    checkInTime: "08:58:45",
    checkOutTime: null,
    checkInLocation: { lat: 12.9819, lng: 77.6036 },
    checkOutLocation: null,
  },
  {
    id: "att003",
    employeeId: "emp006",
    date: formatDate(TODAY),
    status: EmployeeStatus.PRESENT,
    checkInTime: "09:15:11",
    checkOutTime: null,
    checkInLocation: { lat: 12.9634, lng: 77.5855 },
    checkOutLocation: null,
  },
  {
    id: "att004",
    employeeId: "emp007",
    date: formatDate(TODAY),
    status: EmployeeStatus.PRESENT,
    checkInTime: "09:22:37",
    checkOutTime: null,
    checkInLocation: { lat: 12.9592, lng: 77.6974 },
    checkOutLocation: null,
  },
  
  // Employees who are absent today
  {
    id: "att005",
    employeeId: "emp004",
    date: formatDate(TODAY),
    status: EmployeeStatus.ABSENT,
    checkInTime: null,
    checkOutTime: null,
    checkInLocation: null,
    checkOutLocation: null,
  },
  {
    id: "att006",
    employeeId: "emp008",
    date: formatDate(TODAY),
    status: EmployeeStatus.ABSENT,
    checkInTime: null,
    checkOutTime: null,
    checkInLocation: null,
    checkOutLocation: null,
  },
  
  // Employees who are on leave today
  {
    id: "att007",
    employeeId: "emp003",
    date: formatDate(TODAY),
    status: EmployeeStatus.ON_LEAVE,
    checkInTime: null,
    checkOutTime: null,
    checkInLocation: null,
    checkOutLocation: null,
    leaveType: "Sick Leave",
    leaveReason: "Medical appointment",
  },
  {
    id: "att008",
    employeeId: "emp005",
    date: formatDate(TODAY),
    status: EmployeeStatus.ON_LEAVE,
    checkInTime: null,
    checkOutTime: null,
    checkInLocation: null,
    checkOutLocation: null,
    leaveType: "Vacation",
    leaveReason: "Annual family trip",
  },
  
  // Yesterday's attendance
  {
    id: "att009",
    employeeId: "emp001",
    date: formatDate(YESTERDAY),
    status: EmployeeStatus.PRESENT,
    checkInTime: "09:03:15",
    checkOutTime: "18:12:47",
    checkInLocation: { lat: 12.9716, lng: 77.5946 },
    checkOutLocation: { lat: 12.9714, lng: 77.5944 },
  },
  {
    id: "att010",
    employeeId: "emp002",
    date: formatDate(YESTERDAY),
    status: EmployeeStatus.PRESENT,
    checkInTime: "08:55:30",
    checkOutTime: "18:05:22",
    checkInLocation: { lat: 12.9819, lng: 77.6036 },
    checkOutLocation: { lat: 12.9821, lng: 77.6040 },
  },
];

// Helper functions to get attendance data
export function getAttendanceByStatus(status: EmployeeStatus, date: string = formatDate(TODAY)) {
  return attendanceData.filter(
    (record) => record.status === status && record.date === date
  );
}

export function getAttendanceByDate(date: string = formatDate(TODAY)) {
  return attendanceData.filter((record) => record.date === date);
}

export function getEmployeeById(id: string) {
  return employees.find((employee) => employee.id === id);
}

export function getEmployeesByStatus(status: EmployeeStatus, date: string = formatDate(TODAY)) {
  const attendanceRecords = getAttendanceByStatus(status, date);
  return attendanceRecords.map((record) => {
    const employee = getEmployeeById(record.employeeId);
    return {
      ...employee,
      attendance: record,
    };
  });
}

// Dashboard stats
export function getDashboardStats(date: string = formatDate(TODAY)) {
  const presentCount = getAttendanceByStatus(EmployeeStatus.PRESENT, date).length;
  const absentCount = getAttendanceByStatus(EmployeeStatus.ABSENT, date).length;
  const onLeaveCount = getAttendanceByStatus(EmployeeStatus.ON_LEAVE, date).length;
  const totalEmployees = employees.length;
  
  return {
    presentCount,
    absentCount,
    onLeaveCount,
    totalEmployees,
    attendanceRate: (presentCount / totalEmployees) * 100,
  };
}

// Leave data
export const leaveData = [
  {
    id: "leave001",
    employeeId: "emp003",
    type: "Sick Leave",
    reason: "Medical appointment",
    startDate: formatDate(TODAY),
    endDate: formatDate(TODAY),
    status: "Approved",
    approvedBy: "emp005",
  },
  {
    id: "leave002",
    employeeId: "emp005",
    type: "Vacation",
    reason: "Annual family trip",
    startDate: formatDate(TODAY),
    endDate: formatDate(new Date(TODAY.getTime() + 5 * 24 * 60 * 60 * 1000)),
    status: "Approved",
    approvedBy: "emp001",
  },
];