const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("accessToken");

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
  console.log('res', response)
  if (!response.ok) {
    throw new Error(data?.message || "API request failed");
  }

  return data;
}