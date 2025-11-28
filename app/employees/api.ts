import { getCookie } from "cookies-next";
import { getApiBaseUrl } from "@/lib/api-config";
function decryptUserId(encryptedUserId: string): string {
    try {
        return Buffer.from(encryptedUserId, 'base64').toString('utf8');
    } catch {
        return encryptedUserId;
    }
}

export const getEmployeeList = async (encryptedUserId: string) => {
    const token = getCookie("token") || "";
    const decryptedUserId = decryptUserId(encryptedUserId);
    console.log("Decrypted User ID:", decryptedUserId);

    const res = await fetch(`${getApiBaseUrl()}admin/getEmployeeList`, {
        method: "POST",
        headers: {
            "accept": "*/*",
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: decryptedUserId }),
    });

    if (!res.ok) {
        throw new Error("Failed to get employee list");
    }
    return res.json();
}


export async function getUserDetailsByUserID(user_id: string) {
    const token = getCookie("token") || "";
    const response = await fetch(`${getApiBaseUrl()}user/getUserDetailsByUserID`, {
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