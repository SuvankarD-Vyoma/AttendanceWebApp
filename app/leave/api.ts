import { getCookie } from "cookies-next";

const token = getCookie("token") || "";

export async function getLeaveRequestsByAdmin(admin_id: string) {
    try {
        const response = await fetch('http://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/admin/getLeaveRequestsByAdmin', {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                admin_id
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch leave requests');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        throw error;
    }
}