import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import Bottleneck from "bottleneck";
import { SUBSCAN_API_KEY } from "~/constant";
import { HttpError } from "~/errors/HttpError";
import { logger } from "~/utils/logger";

const API_KEY = SUBSCAN_API_KEY;
if (!API_KEY) throw new Error("Missing SUBSCAN_API_KEY");

// Your fixed Polkadot Subscan base URL
const BASE_URL = "https://polkadot.api.subscan.io/api";

//–– Bottleneck limiter (reservoir will be reset from headers)
const limiter = new Bottleneck({
  reservoir: 1,
  reservoirRefreshAmount: 1,
  reservoirRefreshInterval: 1_000,
  reservoirRefreshIntervalMaximum: 60_000,
  maxConcurrent: 4,
});

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json",
  },
  timeout: 10_000,
});

//–– Refresh rate‑limit state on every response
client.interceptors.response.use((res) => {
  const limit = Number(res.headers["ratelimit-limit"]);
  const remaining = Number(res.headers["ratelimit-remaining"]);
  const resetSec = Number(res.headers["ratelimit-reset"]);

  if (!isNaN(limit) && !isNaN(remaining) && !isNaN(resetSec)) {
    limiter.updateSettings({
      reservoir: remaining,
      reservoirRefreshAmount: limit,
      reservoirRefreshInterval: resetSec * 1_000,
    });
  }
  return res;
});

//–– Retry‑after handling & error‑logging
client.interceptors.response.use(
  (r) => r,
  async (err) => {
    const { config, response } = err;
    const url = config?.url;
    const method = config?.method?.toUpperCase();

    if (response?.status === 429) {
      const retryAfter =
        Number(response.headers["retry-after"] || "1") * 1_000 + 500; // add a small buffer
      logger.warn("429 rate limit – retrying after delay", {
        url,
        method,
        retryAfter,
        remaining: response.headers["ratelimit-remaining"],
      });
      await new Promise((r) => setTimeout(r, retryAfter));
      return client.request(config);
    }

    // log and wrap other errors
    logger.error("Subscan API error", {
      url,
      method,
      status: response?.status,
      requestBody: config?.data,
      responseBody: response?.data,
      message: err.message,
    });

    const status = response?.status ?? 500;
    const message = response?.data?.message || err.message;
    throw new HttpError(status, message);
  }
);

/**
 * Call any Subscan endpoint under https://polkadot.api.subscan.io/api.
 *
 * @param endpoint  e.g. '/now' or '/scan/metadata'
 * @param data      POST payload (defaults to `{}`)
 * @param config    extra Axios config if needed
 */
export async function subscanRequest<T = any>(
  endpoint: string,
  data: Record<string, any> = {},
  config: AxiosRequestConfig = {}
): Promise<T> {
  logger.info("Subscan request", {
    endpoint,
    data,
    config
  });
  try {
    const res = await limiter.schedule(() =>
      client.post(endpoint, data, config)
    );
    return res.data;
  } catch (err: any) {
    // Ensure everything bubbles up as HttpError
    if (!(err instanceof HttpError)) {
      logger.error("subscanRequest failed", {
        endpoint,
        data,
        err: err.message,
      });
      throw new HttpError(err.status ?? 500, err.message);
    }
    throw err;
  }
}
