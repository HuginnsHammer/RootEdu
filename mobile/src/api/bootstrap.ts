import { apiRequest } from "./client";

export type MobileBootstrap = {
  product: string;
  institution: string;
  pilot: string;
  programmes: Array<{ code: string; name: string }>;
  capabilities: Record<string, string>;
};

export function fetchMobileBootstrap() {
  return apiRequest<MobileBootstrap>("/mobile/bootstrap");
}
