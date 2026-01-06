import { getApiBaseUrl } from "@/lib/api-config";
import { getCookie } from "cookies-next";

export interface AbsentEmployeeListParams {
  admin_id: string;
  org_id?: number;
  from_date: string;
  to_date: string;
  apiUrl?: string;
  token?: string;
  [key: string]: any;
}

export async function getAbsentEmployeeList({
  admin_id,
  org_id = 1,
  from_date,
  to_date,
  apiUrl = `${getApiBaseUrl()}admin/getAbsentEmployeeList`, 
  token,
}: AbsentEmployeeListParams) {
  const bearerToken = token || getCookie("token") || "";
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${bearerToken}`);
  const body = JSON.stringify({
    admin_id,
    org_id,
    from_date,
    to_date,
  });
  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body,
    redirect: "follow",
  };
  try {
    const response = await fetch(apiUrl, requestOptions);
    if (!response.ok) {
      throw new Error(`Failed to fetch absent employee list: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}
