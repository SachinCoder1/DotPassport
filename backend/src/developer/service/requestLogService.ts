import { RequestLog, IRequestLog } from '../models/RequestLog';
import { HttpError } from '~/errors/HttpError';
import { Types } from 'mongoose';
import { logger } from '~/utils/logger';

export interface CreateRequestLogData {
  apiKeyId: string;
  polkadotAddress?: string;
  endpoint: string;
  method: string;
  isWidget: boolean;
  statusCode: number;
  responseTime: number;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  errorMessage?: string;
  ipAddress: string;
  userAgent: string;
}

export async function createRequestLog(
  data: CreateRequestLogData
): Promise<IRequestLog> {
  try {
    return await RequestLog.create({
      apiKeyId: new Types.ObjectId(data.apiKeyId),
      polkadotAddress: data.polkadotAddress,
      endpoint: data.endpoint,
      method: data.method,
      isWidget: data.isWidget,
      statusCode: data.statusCode,
      responseTime: data.responseTime,
      requestHeaders: data.requestHeaders,
      requestBody: data.requestBody,
      responseBody: data.responseBody,
      errorMessage: data.errorMessage,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  } catch (err: any) {
    logger.error('Error creating request log', { error: err });
    throw new HttpError(500, 'Failed to create request log');
  }
}

export interface GetRequestLogsOptions {
  apiKeyId?: string;
  polkadotAddress?: string;
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  isWidget?: boolean; // Filter by widget status (true = only widgets, false = exclude widgets, undefined = all)
}

export async function getRequestLogs(options: GetRequestLogsOptions) {
  try {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 50, 100);
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (options.apiKeyId)
      query.apiKeyId = new Types.ObjectId(options.apiKeyId);
    if (options.polkadotAddress)
      query.polkadotAddress = options.polkadotAddress;
    if (options.endpoint)
      query.endpoint = { $regex: options.endpoint, $options: 'i' };
    if (options.method) query.method = options.method;
    if (options.statusCode) query.statusCode = options.statusCode;
    if (typeof options.isWidget === 'boolean') query.isWidget = options.isWidget;
    if (options.startDate || options.endDate) {
      query.timestamp = {};
      if (options.startDate) query.timestamp.$gte = options.startDate;
      if (options.endDate) query.timestamp.$lte = options.endDate;
    }

    // Execute query
    const [logs, total] = await Promise.all([
      RequestLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      RequestLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (err: any) {
    logger.error('Error fetching request logs', { error: err });
    throw new HttpError(500, 'Failed to fetch request logs');
  }
}

export async function getRequestLogStats(
  polkadotAddress: string
): Promise<{
  total: number;
  byStatus: {
    '2xx': number;
    '4xx': number;
    '5xx': number;
  };
  avgResponseTime: number;
  byEndpoint: Array<{ endpoint: string; count: number }>;
  byMethod: Array<{ method: string; count: number }>;
  recentLogs: Array<any>;
}> {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Filter to exclude widget logs - only show API method calls
    const baseQuery = { polkadotAddress, isWidget: false };

    const [totalRequests, statusAgg, avgTime, endpointAgg, methodAgg, recentLogs] = await Promise.all(
      [
        RequestLog.countDocuments(baseQuery),
        RequestLog.aggregate([
          { $match: baseQuery },
          {
            $group: {
              _id: '$statusCode',
              count: { $sum: 1 },
            },
          },
        ]),
        RequestLog.aggregate([
          { $match: baseQuery },
          {
            $group: {
              _id: null,
              avgResponseTime: { $avg: '$responseTime' },
            },
          },
        ]),
        RequestLog.aggregate([
          { $match: baseQuery },
          {
            $group: {
              _id: '$endpoint',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        RequestLog.aggregate([
          { $match: baseQuery },
          {
            $group: {
              _id: '$method',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ]),
        RequestLog.find(baseQuery)
          .sort({ timestamp: -1 })
          .limit(10)
          .lean(),
      ]
    );

    // Categorize status codes into 2xx, 4xx, 5xx
    const byStatus = {
      '2xx': 0,
      '4xx': 0,
      '5xx': 0,
    };

    statusAgg.forEach((item) => {
      const statusCode = item._id;
      if (statusCode >= 200 && statusCode < 300) {
        byStatus['2xx'] += item.count;
      } else if (statusCode >= 400 && statusCode < 500) {
        byStatus['4xx'] += item.count;
      } else if (statusCode >= 500 && statusCode < 600) {
        byStatus['5xx'] += item.count;
      }
    });

    const byEndpoint = endpointAgg.map((item) => ({
      endpoint: item._id,
      count: item.count,
    }));

    const byMethod = methodAgg.map((item) => ({
      method: item._id,
      count: item.count,
    }));

    return {
      total: totalRequests,
      byStatus,
      avgResponseTime: avgTime[0]?.avgResponseTime || 0,
      byEndpoint,
      byMethod,
      recentLogs,
    };
  } catch (err: any) {
    logger.error('Error fetching request log stats', { error: err });
    throw new HttpError(500, 'Failed to fetch request log stats');
  }
}
