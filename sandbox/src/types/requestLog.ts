export interface RequestLog {
  id: string;
  apiKeyId: string;
  polkadotAddress: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  statusCode: number;
  responseTime: number;
  timestamp: string;
  requestHeaders: Record<string, string>;
  requestBody: unknown;
  errorMessage?: string;
  ipAddress: string;
  userAgent: string;
}

export interface RequestLogFilters {
  startDate?: string;
  endDate?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedRequestLogs {
  logs: RequestLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RequestStats {
  total: number;
  byStatus: {
    '2xx': number;
    '3xx': number;
    '4xx': number;
    '5xx': number;
  };
  avgResponseTime: number;
  byEndpoint: {
    endpoint: string;
    count: number;
  }[];
  byMethod: {
    method: string;
    count: number;
  }[];
  recentLogs: RequestLog[];
}

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type StatusCodeRange = '2xx' | '4xx' | '5xx';
