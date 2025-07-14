import React from "react";

export default function LeaveLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-8xl mx-auto p-6">{children}</main>
        </div>
    );
}