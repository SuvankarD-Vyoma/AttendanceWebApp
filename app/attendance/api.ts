export async function getAdminAttendanceInfo({
  token,
  admin_id,
  status_id = 0,
  from_date,
  to_date,
  page_no = 0,
  page_size = 0,
  apiUrl = "http://115.187.62.16:8005/VYOMAUMSRestAPI/api/admin/getAdminAttendanceInfo"
}: {
  token: string;
  admin_id: string;
  status_id?: number;
  from_date: string;
  to_date: string;
  page_no?: number;
  page_size?: number;
  apiUrl?: string;
}) {
  if (!token) {
    return { data: null, error: "No authentication token found" };
  }

  const myHeaders = new Headers();
  myHeaders.append("accept", "*/*");
  myHeaders.append("Authorization", `Bearer ${token}`);
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    admin_id,
    status_id,
    from_date,
    to_date,
    page_no,
    page_size
  });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    const response = await fetch(apiUrl, requestOptions);
    const resultText = await response.text();
    if (!response.ok) {
      return { data: null, error: `HTTP error: ${response.status} - ${resultText}` };
    }
    if (!resultText) {
      return { data: null, error: "Empty response" };
    }
    try {
      return JSON.parse(resultText);
    } catch (err) {
      return { data: null, error: "Invalid JSON response" };
    }
  } catch (error: any) {
    return { data: null, error: error?.message || "Fetch error" };
  }
}