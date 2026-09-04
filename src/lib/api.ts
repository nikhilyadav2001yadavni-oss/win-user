import { getClientCookie } from "./cookie.client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const tokenName =
  process.env.NEXT_PUBLIC_TOKEN_NAME || "accessToken";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = getClientCookie(tokenName);
  const isFormData = options.body instanceof FormData;

  const headers = new Headers(options.headers);

  if (isFormData) {
    headers.delete("Content-Type");
  } else {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  const contentType = response.headers.get("content-type");

  let data: any = null;

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data?.message
        ? data.message
        : "API request failed"
    );
  }

  return data;
}
