"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getEmployeeById } from "@/lib/data";
import { format } from "date-fns";

// Mock recent activity data
const recentActivity = [
  {
    id: "act001",
    employeeId: "emp001",
    action: "check_in",
    timestamp: new Date().setHours(9, 5, 22),
    location: { lat: 12.9716, lng: 77.5946 },
  },
  {
    id: "act002",
    employeeId: "emp002",
    action: "check_in",
    timestamp: new Date().setHours(8, 58, 45),
    location: { lat: 12.9819, lng: 77.6036 },
  },
  {
    id: "act003",
    employeeId: "emp006",
    action: "check_in",
    timestamp: new Date().setHours(9, 15, 11),
    location: { lat: 12.9634, lng: 77.5855 },
  },
  {
    id: "act004",
    employeeId: "emp007",
    action: "check_in",
    timestamp: new Date().setHours(9, 22, 37),
    location: { lat: 12.9592, lng: 77.6974 },
  },
  {
    id: "act005",
    employeeId: "emp005",
    action: "leave_approved",
    timestamp: new Date().setHours(8, 30, 0),
    details: "Vacation from 12/04/2025 to 16/04/2025",
  },
  {
    id: "act006",
    employeeId: "emp003",
    action: "leave_approved",
    timestamp: new Date().setHours(8, 45, 0),
    details: "Sick Leave on 12/04/2025",
  },
].sort((a, b) => b.timestamp - a.timestamp);

export default function RecentActivity() {
  return (
    <div className="space-y-4">
      {recentActivity.map((activity) => {
        const employee = getEmployeeById(activity.employeeId);
        if (!employee) return null;
        
        return (
          <div 
            key={activity.id}
            className="flex items-start gap-4 p-3 rounded-lg transition-colors hover:bg-secondary/50"
          >
            <Avatar>
              <AvatarImage src={employee.avatar} alt={employee.name} />
              <AvatarFallback>
                {employee.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="font-medium">{employee.name}</div>
                <div className="text-xs text-muted-foreground">
                  {format(activity.timestamp, "h:mm a")}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "h-6 capitalize",
                    activity.action === "check_in" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                    activity.action === "check_out" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                    activity.action === "leave_approved" && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                  )}
                >
                  {activity.action.replace("_", " ")}
                </Badge>
                {activity.action === "check_in" && (
                  <span>Checked in at {format(activity.timestamp, "h:mm a")}</span>
                )}
                {activity.action === "check_out" && (
                  <span>Checked out at {format(activity.timestamp, "h:mm a")}</span>
                )}
                {activity.action === "leave_approved" && (
                  <span>{activity.details}</span>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                {employee.department} • {employee.position}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}