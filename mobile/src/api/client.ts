const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });
  if (!response.ok) throw new Error(`RootEdu API request failed (${response.status})`);
  return (await response.json()) as T;
}
