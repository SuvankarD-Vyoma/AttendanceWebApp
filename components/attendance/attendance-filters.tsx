"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

export default function AttendanceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Update URL with the selected date
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      
      const params = new URLSearchParams(searchParams.toString());
      params.set("date", format(date, "yyyy-MM-dd"));
      
      // Maintain the current status if it exists
      if (searchParams.has("status")) {
        params.set("status", searchParams.get("status")!);
      }
      
      router.push(`/attendance?${params.toString()}`);
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start text-left font-normal w-[240px]"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}