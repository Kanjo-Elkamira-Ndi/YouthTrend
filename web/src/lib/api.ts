import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const language = localStorage.getItem("language") || "en";
  config.headers["Accept-Language"] = language;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const publicPaths = [
        "/signin", "/signup", "/forgot-password",
        "/reset-password", "/check-inbox", "/",
      ];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = "/signin";
      }
    }
    return Promise.reject(err);
  },
);

export const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

export const unwrapPaginated = <T>(res: {
  data: { data: T[]; meta: PaginationMeta };
}): { data: T[]; meta: PaginationMeta } => res.data;

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
