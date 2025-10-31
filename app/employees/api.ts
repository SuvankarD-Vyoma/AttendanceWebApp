import { getCookie } from "cookies-next";

// Example decrypt function for demonstration purposes.
// Replace this implementation with your actual decryption logic as needed.
function decryptUserId(encryptedUserId: string): string {
    // For illustration, let's assume a simple base64 decode.
    // You should use your REAL decryption function here.
    try {
        return Buffer.from(encryptedUserId, 'base64').toString('utf8');
    } catch {
        // fallback if not base64 or decryption fails
        return encryptedUserId;
    }
}

export const getEmployeeList = async (encryptedUserId: string) => {
    const token = getCookie("token") || "";

    // Decrypt the encrypted user ID
    const decryptedUserId = decryptUserId(encryptedUserId);
    // Show the decrypted value (console or return — here, print it)
    console.log("Decrypted User ID:", decryptedUserId);

    const res = await fetch("https://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/admin/getEmployeeList", {
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