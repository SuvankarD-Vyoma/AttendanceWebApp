import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import RootLayoutClient from "@/components/layout/root-layout-client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vyoma Innovus Global - Attendance Dashboard",
  description: "Employee attendance tracking system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Client-side wrapper → contains navbar, sidebar, etc */}
          <RootLayoutClient>
            {children}
          </RootLayoutClient>

          {/* Notifications */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
