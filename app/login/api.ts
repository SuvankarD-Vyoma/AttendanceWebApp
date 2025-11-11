import { setCookie } from "cookies-next";

type LoginApiParams = {
  username: string;
  password: string;
  authToken: string;
  url: string;
};

export async function loginApi({
  username,
  password,
  authToken,
  url
}: LoginApiParams) {
  const myHeaders = new Headers();

  myHeaders.append("accept", "*/*");
  myHeaders.append("Authorization", `Bearer ${authToken}`);
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    username,
    password
  });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Save the token in cookies, if present in result
    if (result?.data?.access_token) {
      setCookie("access_token", result.data.access_token);
    }

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
