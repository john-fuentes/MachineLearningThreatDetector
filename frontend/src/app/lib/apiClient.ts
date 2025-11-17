// src/app/lib/apiClient.ts
import axios, { InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PRIVATE_API_URL ||
  "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

//  Token injector (Axios v1.x-compatible)
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession();

    // Ensure headers object always exists
    config.headers = config.headers || ({} as any);

    // Always send JSON
    (config.headers as any)["Content-Type"] = "application/json";

    if (session?.accessToken) {
      (config.headers as any)["Authorization"] = `Bearer ${session.accessToken}`;
      console.log(" Injecting token for request:", session.accessToken);
    } else {
      console.warn(" No access token found in session");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Global 401 handler
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.warn(" Unauthorized — redirecting to signin");
      if (typeof window !== "undefined") window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);
