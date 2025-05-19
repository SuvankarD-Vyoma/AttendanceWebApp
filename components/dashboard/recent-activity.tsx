"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getEmployeeById } from "@/lib/data";
import { format } from "date-fns";
import { getAdminAttendanceInfo } from "@/app/dashboard/api"; // <-- Add this import

// Base URL for token generation
const Genarate_Token = process.env.NEXT_PUBLIC_API_URL_AUTH;

// Helper to get cookie value
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return "";
}



export default function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      // Declare token variable in the outer scope
      let token = "";

      // 1. Get token from generateToken API
      try {
        const tokenResponse = await fetch(`${Genarate_Token}auth/generateToken`, {
          method: "POST",
          headers: {
            "Authorization": "Basic dGVzdDAwMDE6YWRtaW5AMTIz",
            "Content-Type": "application/json",
          },
          
        });
        if (!tokenResponse.ok) {
          throw new Error("Failed to generate token")
        }
        const tokenText = await tokenResponse.json();

        const tokenData = tokenText.data.access_token
        token = tokenData
        // token = tokenData.token || tokenData.access_token || tokenData.data || "";
       console.log("Token:", token);
        if (!tokenData) {
          setError("Token not found in response");
          setLoading(false);
          return;
        }
      } catch (err) {
        setError("Error fetching token");
        setLoading(false);
        return;
      }

      // 2. Get admin_emp_id from cookies
      const admin_emp_id = getCookie("userId") || "";
      // console.log("Admin Employee ID:", admin_emp_id);

      // 3. Get current date in dd-MM-yyyy format
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      const dateStr = `${dd}-${mm}-${yyyy}`;

      // 4. Fetch attendance data
      const data = await getAdminAttendanceInfo(token, admin_emp_id, dateStr, dateStr);
      console.log("Attendance Data:", data);

      // 5. Set activities (adjust as per your API response)
      if (data.error) {
        setError(data.error);
        setActivities([]);
      } else {
        setActivities(data.data ? [data.data] : []);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      {activities.map((activity, idx) => {
        const employee = getEmployeeById(activity.emp_id);
        if (!employee) return null;

        return (
          <div
            key={activity.emp_id || idx}
            className="flex items-start gap-4 p-3 rounded-lg transition-colors hover:bg-secondary/50"
          >
            <Avatar>
              <AvatarImage src={employee.avatar} alt={employee.name} />
              <AvatarFallback>
                {employee.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="font-medium">{employee.name}</div>
                <div className="text-xs text-muted-foreground">
                  {activity.checkin_time
                    ? format(new Date(`1970-01-01T${activity.checkin_time}`), "h:mm a")
                    : "--"}
                </div>
              </div>

              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Badge variant="outline" className="h-6 capitalize bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {activity.checkin_time ? "check in" : "no check in"}
                </Badge>
                {activity.checkin_time && (
                  <span>Checked in at {activity.checkin_time}</span>
                )}
                {activity.details && (
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