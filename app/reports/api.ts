import { getCookie } from "cookies-next";
import { getApiBaseUrl } from "@/lib/api-config";

export async function getAttendenceSummaryDetails(
  admin_id: string,
  start_date: number,
  end_date: number
) {
  const token = getCookie("token") || "";

  const body = JSON.stringify({
    admin_id,
    start_date,
    end_date,
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
