import { getCookie } from "cookies-next";

export async function saveEmployee(payload: any) {
  const token = getCookie("token") || "";

  const res = await fetch("https://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/admin/saveEmployeeInfo", {
    method: "POST",
    headers: {
      "accept": "*/*",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to add employee");
  }
  return res.json();
}


export async function getAllBloodGroup() {
  const token = getCookie("token") || "";
  const res = await fetch("https://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/admin/getAllBloodGroup", {
    method: "POST",
    headers: {
      "accept": "*/*",
      "Authorization": `Bearer ${token}`,
    },
    body: "", // POST with empty body
  });

  if (!res.ok) {
    throw new Error("Failed to fetch blood groups");
  }
  return res.json();
}


export const getAllGender = async ()=>{
  const token = getCookie("token") || "";
  const res = await fetch("https://wbassetmgmtservice.link/VYOMAUMSRestAPI/api/admin/getAllGender", {
    method: "POST",
    headers: {
      "accept": "*/*",
      "Authorization": `Bearer ${token}`,
    },
    body: "",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch genders");
  }
  return res.json();
}