import { getCookie } from "cookies-next";

export const getEmployeeList = async (user_id: string) => {
    const token = getCookie("token") || "";

    const res = await fetch("https://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/admin/getEmployeeList", {
        method: "POST",
        headers: {
            "accept": "*/*",
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user_id }),
    });

    if (!res.ok) {
        throw new Error("Failed to get employee list");
    }
    return res.json();
}


export async function getUserDetailsByUserID(user_id: string) {
    const token = getCookie("token") || "";
    const response = await fetch('http://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/user/getUserDetailsByUserID', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id }),
    });
    if (!response.ok) throw new Error('Failed to fetch user details');
    return response.json();
  }