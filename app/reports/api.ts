import { getCookie } from "cookies-next";
import { getApiBaseUrl } from "@/lib/api-config";

export async function getAttendenceSummaryDetails(
  admin_id: string,
  month_number: number,
  year_number: number
) {
  const token = getCookie("token") || "";

  const body = JSON.stringify({
    admin_id,
    month_number,
    year_number,
  });

  const response = await fetch(`${getApiBaseUrl()}admin/getAttendenceSummaryDetails`, {
    method: "POST",
    headers: {
      "accept": "*/*",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch attendance summary: ${response.statusText}`);
  }

  return response.json();
}
