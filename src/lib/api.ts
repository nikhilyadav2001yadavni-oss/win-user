import { getClientCookie } from "./cookie.client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "";
const tokenName = process.env.NEXT_PUBLIC_TOKEN_NAME || "accessToken";
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  // Get token from shared cookie
  const token = getClientCookie(tokenName);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  console.log("res", response);

  if (!response.ok) {
    throw new Error(data?.message || "API request failed");
  }

  return data;
}
