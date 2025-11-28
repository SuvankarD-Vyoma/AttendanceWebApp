import { getCookie } from "cookies-next";
import { getApiBaseUrl } from "@/lib/api-config";

export async function saveEmployee(payload: any) {
  const token = getCookie("token") || "";

  const res = await fetch(`${getApiBaseUrl()}admin/saveEmployeeInfo`, {
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
  const res = await fetch(`${getApiBaseUrl()}admin/getAllBloodGroup`, {
    method: "POST", 
    headers: {
      "accept": "*/*",
      "Authorization": `Bearer ${token}`,
    },
    body: "",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch blood groups");
  }
  return res.json();
}

export const getAllGender = async ()=>{
  const token = getCookie("token") || "";
  const res = await fetch(`${getApiBaseUrl()}admin/getAllGender`, {
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