import { getCookie } from "cookies-next";

const token = getCookie("token") || "";

export async function getAdminAttendanceInfo(admin_emp_id: string, from_date: string, to_date: string) {
    const res = await fetch("https://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/admin/getAdminAttendanceInfo", {
      method: "POST",
      headers: {
        "accept": "*/*",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        admin_emp_id,
        status_id: 0,
        from_date,
        to_date,
        page_no: 0,
        page_size: 0,
      }),
    });
  
    const text = await res.text();
    if (!res.ok) {
      return { data: null, error: `HTTP error: ${res.status}` };
    }
    if (!text) {
      return { data: null, error: "Empty response" };
    }
    try {
      return JSON.parse(text);
    } catch {
      return { data: null, error: "Invalid JSON response" };
    }
  }