import axios, { AxiosRequestConfig } from "axios";
import { Env } from "src/constant/env";
import { LocalStorage } from "src/lib/localStorage";

const formatRequestConfig = (config?: AxiosRequestConfig) => {
  const token = LocalStorage.getCache(Env.JWT_TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  return { ...config, headers: { ...config?.headers, ...headers } };
};

export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return new Promise((resolve, reject) => {
    axios
      .get(url, formatRequestConfig(config))
      .then((response) => {
        if (response.status !== 200) {
          return reject(response.data);
        }
        return resolve(response.data);
      })
      .catch((e) => {
        console.log("e", e);
        console.log("url", url);
        if (e.response.status === 401 && url !== "/api/auth/sign-in") {
          window.location.href = "/auth/sign-in";
        }
        reject(e.response?.data || e);
      });
  });
};

export const del = async (url: string, config?: AxiosRequestConfig): Promise<never> => {
  return new Promise((resolve, reject) => {
    axios
      .delete(url, formatRequestConfig(config))
      .then((response) => {
        if (response.status !== 200) {
          return reject(response.data);
        }
        return resolve(response.data);
      })
      .catch((e) => {
        if (e.response.status === 401) {
          window.location.href = "/auth/sign-in";
        }
        reject(e.response?.data || e);
      });
  });
};

export const post = async <T>(arg: {
  url: string;
  payload: Record<string, never | FormDataEntryValue>;
  config?: AxiosRequestConfig;
}): Promise<T> => {
  const { url, payload, config } = arg;
  return new Promise((resolve, reject) => {
    axios
      .post(url, payload, formatRequestConfig(config))
      .then((response) => {
        if (response.status > 300) {
          return reject(response.data);
        }
        return resolve(response.data);
      })
      .catch((e) => {
        if (e.response.status === 401) {
          window.location.href = "/auth/sign-in";
        }
        reject(e.response?.data || e);
      });
  });
};
