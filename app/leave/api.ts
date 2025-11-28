import { getCookie } from "cookies-next";



export async function getLeaveRequestsByAdmin(admin_id: string) {
    try {
        const token = getCookie("token") || "";
        const response = await fetch('http://115.187.62.16:8005/VYOMAUMSRestAPI/api/admin/getLeaveRequestsByAdmin', {
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

export async function approvalOfEmployeeLeaveRequestByAdmin(payload: any) {
    try {
        const token = getCookie("token") || "";
        const response = await fetch("http://115.187.62.16:8005/VYOMAUMSRestAPI/api/admin/approvalOfEmployeeLeaveRequestByAdmin", {
            method: "POST",
            headers: {
                'accept': '*/*',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        let responseData: any = null;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = {};
        }

        if (response.ok) {
            return responseData;
        } else {
            throw new Error(responseData?.message || "Failed to update leave status.");
        }

    } catch (error) {
        console.error('Error approving/rejecting leave request:', error);
        throw error;
    }
}

export async function getEmployeeAvailableLeaveList(admin_id: string) {
    try {
        const currentToken = getCookie("token") || "";
        const myHeaders = new Headers();
        myHeaders.append("accept", "*/*");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${currentToken}`);

        const raw = JSON.stringify({
            "admin_id": admin_id
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow" as RequestRedirect
        };

        const response = await fetch("http://115.187.62.16:8005/VYOMAUMSRestAPI/api/admin/getEmployeeAvailableLeaveList", requestOptions);

        if (!response.ok) {
            throw new Error('Failed to fetch employee available leave list');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching employee available leave list:', error);
        throw error;
    }
}

