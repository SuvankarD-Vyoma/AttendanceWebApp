import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserMinus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmployeeStatus } from "@/lib/types";

interface DashboardStatCardProps {
  title: string;
  value: number;
  description: string;
  icon: "users" | "user-minus" | "calendar";
  status: EmployeeStatus;
}

export default function DashboardStatCard({
  title,
  value,
  description,
  icon,
  status,
}: DashboardStatCardProps) {
  // Determine icon to display
  const Icon = {
    "users": Users,
    "user-minus": UserMinus,
    "calendar": Calendar,
  }[icon];

  // Determine styling based on status
  const getStatusStyles = () => {
    switch (status) {
      case EmployeeStatus.PRESENT:
        return {
          cardBorder: "border-l-4 border-l-green-500 dark:border-l-green-400",
          iconBg: "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400",
          trendUpColor: "text-green-600 dark:text-green-400",
        };
      case EmployeeStatus.ABSENT:
        return {
          cardBorder: "border-l-4 border-l-red-500 dark:border-l-red-400",
          iconBg: "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400",
          trendUpColor: "text-red-600 dark:text-red-400",
        };
      case EmployeeStatus.ON_LEAVE:
        return {
          cardBorder: "border-l-4 border-l-amber-500 dark:border-l-amber-400",
          iconBg: "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
          trendUpColor: "text-amber-600 dark:text-amber-400",
        };
      default:
        return {
          cardBorder: "border-l-4 border-l-primary",
          iconBg: "bg-primary/10 text-primary",
          trendUpColor: "text-primary",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <Card className={cn("transition-all hover:shadow-md", styles.cardBorder)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-full", styles.iconBg)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription>{description}</CardDescription>

      </CardContent>
    </Card>
  );
}