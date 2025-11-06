import axios, { AxiosInstance } from "axios";
import { removeUserInfo, getUserInfo } from "@/utils/storage";
import { decode } from "html-entities";
import { createBrowserHistory } from "history";
import { SCREEN } from "@/router/screen";
import { getToken, isTokenExpired } from "./token";

const history = createBrowserHistory();

class Http {
  instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_ENDPOINT,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With",
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true,
    });

    this.instance.interceptors.request.use(
      (config) => {
        const token = getToken();

        if (token && !isTokenExpired(token)) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response) => {
        if (response) {
          response.data = decodeHtmlEntities(response.data);
        }
        return response;
      },
      async (error) => {
        const status = error.response?.status;
        await removeUserInfo();

        switch (status) {
          case 404:
            history.push(SCREEN.notFound.path);
            break;
          case 500:
            history.push(SCREEN.internalError.path);
            break;
          case 401:
            history.push(SCREEN.login.path);
            break;
          case 403:
            history.push(SCREEN.login.path);
            break;
          default:
            break;
        }

        return Promise.reject(error);
      }
    );
  }
}

function decodeHtmlEntities(data: any): any {
  if (
    data instanceof File ||
    data instanceof ArrayBuffer ||
    data instanceof Blob
  ) {
    return data;
  }
  if (typeof data === "string") {
    return decode(data);
  } else if (Array.isArray(data)) {
    return data.map((item) => decodeHtmlEntities(item));
  } else if (data && typeof data === "object") {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = decodeHtmlEntities(data[key]);
      return acc;
    }, {} as any);
  } else {
    return data;
  }
}

const http = new Http().instance;
export default http;
