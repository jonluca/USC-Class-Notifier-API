import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import { HttpCookieAgent, HttpsCookieAgent } from "http-cookie-agent/http";
import { CookieJar } from "tough-cookie";
export const ciphers = [
  "TLS_AES_128_GCM_SHA256",
  "TLS_AES_256_GCM_SHA384",
  "TLS_CHACHA20_POLY1305_SHA256",
  "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256",
  "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256",
  "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
  "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256",
  "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384",
  "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA",
  "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256",
  "TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA",
  "TLS_RSA_WITH_AES_128_GCM_SHA256",
  "TLS_RSA_WITH_AES_256_GCM_SHA384",
  "TLS_RSA_WITH_AES_128_CBC_SHA",
  "TLS_RSA_WITH_AES_256_CBC_SHA",
  "SSL_RSA_WITH_3DES_EDE_CBC_SHA",
].join(":");

export class BaseService {
  client: AxiosInstance;
  jar: CookieJar;

  constructor() {
    const jar = new CookieJar(undefined, { allowSpecialUseDomain: true, looseMode: true, rejectPublicSuffixes: false });
    this.jar = jar;
    const config: AxiosRequestConfig = { jar };
    config.httpAgent = new HttpCookieAgent({ cookies: { jar }, keepAlive: true });

    config.httpsAgent = new HttpsCookieAgent({
      cookies: { jar },
      keepAlive: true,
      ciphers,
    });

    const client = axios.create(config);
    this.client = client;
  }

  private cleanConfig = (config?: AxiosRequestConfig) => {
    if (config?.headers) {
      const headers = config.headers;
      for (const [key, value] of Object.entries(headers || {})) {
        if (value === undefined || "") {
          delete headers[key];
        }
      }
    }
    return config;
  };

  patch = async <T>(path: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return await this.client.patch(path, data, this.cleanConfig(config));
  };

  post = async <T>(path: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return await this.client.post(path, data, this.cleanConfig(config));
  };
  put = async <T>(path: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return await this.client.put(path, data, this.cleanConfig(config));
  };

  get = async <T>(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const fullPath = path;
    return this.client.get(fullPath, this.cleanConfig(config));
  };

  delete = async <T>(path: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return this.client.delete(path, this.cleanConfig(config));
  };
}
