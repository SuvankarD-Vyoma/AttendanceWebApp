"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { deleteCookie } from "cookies-next";
import {
  ChevronLeft,
  LayoutDashboard,
  Users,
  Calendar,
  Map,
  FileText,
  Settings,
  Clock,
  LogOut
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon: Icon, label, href, isActive, isCollapsed, onClick }: SidebarItemProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          {onClick ? (
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size={isCollapsed ? "icon" : "default"}
              className={cn(
                "w-full justify-start",
                isActive ? "bg-secondary font-medium" : "font-normal"
              )}
              onClick={onClick}
            >
              <Icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
              {!isCollapsed && <span>{label}</span>}
            </Button>
          ) : (
            <Link href={href} className="flex items-center">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  "w-full justify-start",
                  isActive ? "bg-secondary font-medium" : "font-normal"
                )}
              >
                <Icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && <span>{label}</span>}
              </Button>
            </Link>
          )}
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}

interface MainSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function MainSidebar({ isOpen, onToggle }: MainSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    // Clear all auth-related cookies
    deleteCookie("token");
    deleteCookie("userId");
    deleteCookie("username");
    deleteCookie("userRole");
    deleteCookie("userFullName");

    // Redirect to login page
    router.push("/login");
  };

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Employees", href: "/employees" },
    { icon: Clock, label: "Attendance", href: "/attendance" },
    { icon: Calendar, label: "Leave Management", href: "/leave" },
    { icon: Map, label: "Location Tracking", href: "/location" },
    { icon: FileText, label: "Reports", href: "/reports" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <aside
      className={cn(
        "bg-card border-r border-border h-full transition-all duration-300 relative",
        isOpen ? (isCollapsed ? "w-[70px]" : "w-[240px]") : "w-0"
      )}
    >
      {isOpen && (
        <>
          <div className="flex items-center justify-between h-16 px-3 border-b">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                {isCollapsed ? (
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-semibold text-lg">
                    VIG
                  </div>
                ) : (
                  <h1 className="text-sm font-semibold ml-2">
                    Vyoma Innovus Global Private Limited
                  </h1>
                )}
              </Link>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft className={cn("h-5 w-5 transition-transform", isCollapsed && "rotate-180")} />
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-64px)]">
            <div className="space-y-1 p-2">
              {sidebarItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  isActive={pathname === item.href}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>

            <div className="p-2 mt-4">
              <SidebarItem
                icon={LogOut}
                label="Sign Out"
                href="/login"
                isActive={false}
                isCollapsed={isCollapsed}
                onClick={handleLogout}
              />
            </div>
          </ScrollArea>
        </>
      )}
    </aside>
  );
}