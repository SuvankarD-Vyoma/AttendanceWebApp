"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import MainSidebar from "@/components/layout/main-sidebar";
import MainHeader from "@/components/layout/main-header";

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/privacy-policy";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <MainSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <MainHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}