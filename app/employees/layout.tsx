import React from "react";

// Optionally import shared components
// import MainHeader from "@/components/layout/main-header";
// import MainSidebar from "@/components/layout/main-sidebar";

export default function EmployeesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            {/* Uncomment and customize as needed */}
            {/* <MainSidebar /> */}
            <div className="flex flex-col flex-1">
                {/* <MainHeader /> */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
