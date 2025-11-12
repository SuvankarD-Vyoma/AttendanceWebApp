
export async function getAdminAttendanceInfo(
  token: string,
  admin_id: string,
  from_date: string,
  to_date: string
) {
  if (!token) {
    return { data: null, error: "No authentication token found" };
  }

  // Set up headers
  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("Authorization", `Bearer ${token}`);
  myHeaders.append("Content-Type", "application/json");

  
  const raw = JSON.stringify({
    admin_id: admin_id,
    status_id: 0,
    from_date,
    to_date,
    page_no: 0,
    page_size: 0
  });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    const res = await fetch(
      "https://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/admin/getAdminAttendanceInfo",
      requestOptions
    );

    const text = await res.text();
    if (!res.ok) {
      return { data: null, error: `HTTP error: ${res.status} - ${text}` };
    }
    if (!text) {
      return { data: null, error: "Empty response" };
    }
    try {
      return JSON.parse(text);
    } catch {
      return { data: null, error: "Invalid JSON response" };
    }
  } catch (error: any) {
    return { data: null, error: error?.message || "Fetch error" };
  }
}