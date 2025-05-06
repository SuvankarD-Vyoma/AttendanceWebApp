import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AttendanceTable from "@/components/attendance/attendance-table";
import AttendanceFilters from "@/components/attendance/attendance-filters";
import { EmployeeStatus } from "@/lib/types";

interface AttendancePageProps {
  searchParams: {
    status?: string;
    date?: string;
  };
}

export default function AttendancePage({ searchParams }: AttendancePageProps) {
  // Get status from URL or default to 'present'
  const status = searchParams.status || "present";
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            View and manage employee attendance records
          </p>
        </div>
        <AttendanceFilters />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={status} className="space-y-4">
            <TabsList>
              <TabsTrigger value="present">Present</TabsTrigger>
              <TabsTrigger value="absent">Absent</TabsTrigger>
              <TabsTrigger value="on_leave">On Leave</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            <TabsContent value="present" className="space-y-4">
              <AttendanceTable status={EmployeeStatus.PRESENT} />
            </TabsContent>
            
            <TabsContent value="absent" className="space-y-4">
              <AttendanceTable status={EmployeeStatus.ABSENT} />
            </TabsContent>
            
            <TabsContent value="on_leave" className="space-y-4">
              <AttendanceTable status={EmployeeStatus.ON_LEAVE} />
            </TabsContent>
            
            <TabsContent value="all" className="space-y-4">
              <AttendanceTable status="all" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}