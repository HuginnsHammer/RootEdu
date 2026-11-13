import * as SecureStore from "expo-secure-store";

const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";
const API_URL_KEY = "rootedu.api_url";

export async function getApiBaseUrl(): Promise<string> {
  const saved = await SecureStore.getItemAsync(API_URL_KEY);
  return (saved ?? DEFAULT_API_URL).replace(/\/+$/, "");
}

export async function setApiBaseUrl(value: string): Promise<void> {
  const normalized = value.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(normalized)) {
    throw new Error("Enter a complete API URL beginning with http:// or https://.");
  }
  await SecureStore.setItemAsync(API_URL_KEY, normalized);
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });
  if (!response.ok) throw new Error(`RootEdu API request failed (${response.status})`);
  return (await response.json()) as T;
}
