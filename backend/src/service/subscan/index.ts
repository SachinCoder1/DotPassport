import NodeCache from "node-cache";
import { subscanRequest } from "./subscanClient";
import { logger } from "~/utils/logger";
import { HttpError } from "~/errors/HttpError";
import {
  BalanceHistoryEntry,
  BalanceHistoryResponse,
  EventsListResponse,
  ExtrinsicRecord,
  ExtrinsicsListResponse,
  NominatorInfoData,
  NominatorInfoResponse,
  ReferendaVotesResponse,
  ReferendumVoteRecord,
  RewardSlashListResponse,
  RewardSlashRecord,
  ScanEvent,
  StakingRewardSumResponse,
  TokenBalance,
  TokenListResponse,
  Transfer,
  TransfersListResponse,
  VotedValidator,
  VotedValidatorsResponse,
} from "./types";

const ROW_LIMIT_DEFAULT = 100;

// Create a cache instance with a standard Time-To-Live (TTL) of 10 minutes (600 seconds)
const apiCache = new NodeCache({ stdTTL: 600 });

/**
 * Clear cache for a specific function and arguments.
 * @param functionName The name of the cached function.
 * @param args The arguments used in the function call.
 */
export function clearSubscanCache(functionName: string, ...args: any[]): void {
  const key = `${functionName}:${JSON.stringify(args)}`;
  const deleted = apiCache.del(key);
  if (deleted) {
    logger.info(`[CACHE CLEARED] for key: ${key}`);
  }
}

/**
 * Clear all cached data for a specific address across all Subscan functions.
 * @param address The Polkadot address to clear cache for.
 */
export function clearAddressCache(address: string): void {
  // Get all cache keys
  const keys = apiCache.keys();
  let clearedCount = 0;

  // Delete any keys that contain this address
  for (const key of keys) {
    if (key.includes(`"${address}"`)) {
      apiCache.del(key);
      clearedCount++;
    }
  }

  logger.info(`[CACHE CLEARED] ${clearedCount} entries for address: ${address}`);
}

/**
 * A higher-order function that adds a caching layer to any async function.
 * @param fn The async function to wrap.
 * @param functionName A unique name for the function to serve as a namespace for the cache key.
 * @returns A new function that is a cached version of the original.
 */
function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  functionName: string
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Create a unique cache key from the function name and its arguments.
    // JSON.stringify ensures that calls with different arguments have different keys.
    const key = `${functionName}:${JSON.stringify(args)}`;

    // Attempt to retrieve data from the cache.
    const cachedData = apiCache.get(key);
    if (cachedData) {
      logger.info(`[CACHE HIT] for key: ${key}`);
      return cachedData as ReturnType<T>;
    }

    // If not in cache (cache miss), execute the original function.
    logger.info(`[CACHE MISS] for key: ${key}. Fetching from API.`);
    const result = await fn(...args);

    // Store the fresh result in the cache. The default TTL (10 minutes) will be applied.
    apiCache.set(key, result);

    return result;
  }) as T;
}

// ====================================================================================
// API FUNCTIONS (Original implementations are now private)
// ====================================================================================

async function _fetchBalanceHistory(
  address: string,
  start: string,
  end: string
): Promise<BalanceHistoryEntry[]> {
  try {
    const res = await subscanRequest<BalanceHistoryResponse>(
      "/scan/account/balance_history",
      { address, start, end }
    );
    return res.data.history;
  } catch (err: any) {
    logger.error("fetchBalanceHistory failed", { address, start, end, err });
    throw new HttpError(
      err.status || 500,
      `Balance history fetch error: ${err.message}`
    );
  }
}

async function _fetchAccountTokenList(
  address: string
): Promise<TokenBalance[]> {
  try {
    const res = await subscanRequest<TokenListResponse>(
      "/scan/account/tokens",
      { address }
    );
    return res.data.native;
  } catch (err: any) {
    logger.error("fetchAccountTokenList failed", { address, err });
    throw new HttpError(
      err.status || 500,
      `Token list fetch error: ${err.message}`
    );
  }
}

async function _fetchStakingRewardSum(opts: {
  address: string;
  start: string;
  end: string;
  block_range?: string;
}): Promise<number> {
  const { address, start, end, block_range } = opts;
  try {
    const payload: Record<string, any> = { address, start, end };
    if (block_range) payload.block_range = block_range;

    const res = await subscanRequest<StakingRewardSumResponse>(
      "/scan/staking/total_reward",
      payload
    );
    return res.data.sum;
  } catch (err: any) {
    logger.error("fetchStakingRewardSum failed", { opts, err });
    throw new HttpError(
      err.status || 500,
      `Staking reward fetch error: ${err.message}`
    );
  }
}

async function _fetchTransfersList(params: {
  address: string;
  row?: number;
  include_total?: boolean;
  order?: "asc" | "desc";
  success?: boolean;
  page?: number;
}): Promise<{
  count: number;
  total?: Record<string, { sent: string; received: string; total: string }>;
  transfers: Transfer[];
}> {
  const {
    address,
    include_total,
    order = "desc",
    success,
    page = 0,
    row = ROW_LIMIT_DEFAULT,
  } = params;

  try {
    const payload: Record<string, any> = { address, order, page, row };
    if (include_total !== undefined) payload.include_total = include_total;
    if (success !== undefined) payload.success = success;

    const res = await subscanRequest<TransfersListResponse>(
      "/v2/scan/transfers",
      payload
    );
    return {
      count: res.data.count,
      total: res.data.total,
      transfers: res.data.transfers,
    };
  } catch (err: any) {
    logger.error("fetchTransfersList failed", { params, err });
    throw new HttpError(
      err.status || 500,
      `Transfers list fetch error: ${err.message}`
    );
  }
}

async function _fetchEventsList(params: {
  address: string;
  after_id?: number;
  block_num?: number;
  block_range?: string;
  event_id?: string;
  extrinsic_index?: string;
  finalized?: boolean;
  focus?: string;
  module?: string;
  order?: "asc" | "desc";
  page?: number;
  phase?: 0 | 1 | 2;
  row?: number;
}): Promise<{
  count: number;
  events: ScanEvent[];
}> {
  const {
    address,
    after_id,
    block_num,
    block_range,
    event_id,
    extrinsic_index,
    finalized,
    focus,
    module,
    order = "desc",
    page = 0,
    phase,
    row = ROW_LIMIT_DEFAULT,
  } = params;

  try {
    const payload: Record<string, any> = { address, order, page, row };
    if (after_id !== undefined) payload.after_id = after_id;
    if (block_num !== undefined) payload.block_num = block_num;
    if (block_range !== undefined) payload.block_range = block_range;
    if (event_id !== undefined) payload.event_id = event_id;
    if (extrinsic_index !== undefined)
      payload.extrinsic_index = extrinsic_index;
    if (finalized !== undefined) payload.finalized = finalized;
    if (focus !== undefined) payload.focus = focus;
    if (module !== undefined) payload.module = module;
    if (phase !== undefined) payload.phase = phase;

    const res = await subscanRequest<EventsListResponse>(
      "/v2/scan/events",
      payload
    );
    return {
      count: res.data.count,
      events: res.data.events,
    };
  } catch (err: any) {
    logger.error("fetchEventsList failed", { params, err });
    throw new HttpError(
      err.status || 500,
      `Events list fetch error: ${err.message}`
    );
  }
}

async function _fetchNominatorInfo(
  address: string
): Promise<NominatorInfoData> {
  try {
    const res = await subscanRequest<NominatorInfoResponse>(
      "/scan/staking/nominator",
      { address }
    );
    return res.data;
  } catch (err: any) {
    logger.error("fetchNominatorInfo failed", { address, err });
    throw new HttpError(
      err.status || 500,
      `Nominator info fetch error: ${err.message}`
    );
  }
}

async function _fetchVotedValidatorsList(
  address: string
): Promise<VotedValidator[] | null> {
  try {
    const res = await subscanRequest<VotedValidatorsResponse>(
      "/scan/staking/voted",
      { address }
    );
    return res.data.list;
  } catch (err: any) {
    logger.error("fetchVotedValidatorsList failed", { address, err });
    throw new HttpError(
      err.status || 500,
      `Voted validators fetch error: ${err.message}`
    );
  }
}

async function _fetchAccountRewardSlashList(params: {
  address: string;
  block_range?: string;
  category?: "Reward" | "Slash";
  claimed_filter?: "unclaimed" | "claimed";
  is_stash?: boolean;
  page?: number;
  row?: number;
}): Promise<{
  count: number;
  list: RewardSlashRecord[];
}> {
  const {
    address,
    block_range,
    category,
    claimed_filter,
    is_stash,
    page = 0,
    row = ROW_LIMIT_DEFAULT,
  } = params;

  try {
    const payload: Record<string, any> = { address, page, row };
    if (block_range !== undefined) payload.block_range = block_range;
    if (category !== undefined) payload.category = category;
    if (claimed_filter !== undefined) payload.claimed_filter = claimed_filter;
    if (is_stash !== undefined) payload.is_stash = is_stash;

    const res = await subscanRequest<RewardSlashListResponse>(
      "/scan/account/reward_slash",
      payload
    );
    return {
      count: res.data.count,
      list: res.data.list,
    };
  } catch (err: any) {
    logger.error("fetchAccountRewardSlashList failed", { params, err });
    throw new HttpError(
      err.status || 500,
      `Account reward/slash list fetch error: ${err.message}`
    );
  }
}

async function _fetchExtrinsicsList(params: {
  address: string;
  module?: string;
  success?: boolean;
  order?: "asc" | "desc";
  page?: number;
  row?: number;
}): Promise<{
  count: number;
  extrinsics: ExtrinsicRecord[];
}> {
  const {
    address,
    module,
    success,
    order = "asc",
    page = 0,
    row = ROW_LIMIT_DEFAULT,
  } = params;

  try {
    const payload: Record<string, any> = { address, order, page, row };
    if (module !== undefined) payload.module = module;
    if (success !== undefined) payload.success = success;

    const res = await subscanRequest<ExtrinsicsListResponse>(
      "/v2/scan/extrinsics",
      payload
    );
    return {
      count: res.data.count,
      extrinsics: res.data.extrinsics,
    };
  } catch (err: any) {
    logger.error("fetchExtrinsicsList failed", { params, err });
    throw new HttpError(
      err.status || 500,
      `Extrinsics list fetch error: ${err.message}`
    );
  }
}

async function _fetchReferendaVotes(params: {
  account: string;
  order?: "asc" | "desc";
  page?: number;
  referendum_index?: number;
  row?: number;
  sort?: "conviction" | "amount" | "votes";
  status?: "Ayes" | "Nays" | "Abstains";
  valid?: boolean;
}): Promise<{
  count: number;
  list: ReferendumVoteRecord[] | null;
}> {
  const {
    account,
    order = "desc",
    page = 0,
    referendum_index,
    row = ROW_LIMIT_DEFAULT,
    sort,
    status,
    valid,
  } = params;

  try {
    const payload: Record<string, any> = { account, order, page, row };
    if (referendum_index !== undefined)
      payload.referendum_index = referendum_index;
    if (sort !== undefined) payload.sort = sort;
    if (status !== undefined) payload.status = status;
    if (valid !== undefined) payload.valid = valid;

    const res = await subscanRequest<ReferendaVotesResponse>(
      "/scan/referenda/votes",
      payload
    );

    return {
      count: res.data.count,
      list: res.data.list,
    };
  } catch (err: any) {
    logger.error("fetchReferendaVotes failed", { params, err });
    throw new HttpError(
      err.status || 500,
      `Referenda votes fetch error: ${err.message}`
    );
  }
}

// NOTE: This function calls another wrapped function, so it will benefit
// from the cache on `fetchExtrinsicsList` automatically.
async function _fetchAccountAgeDays(address: string): Promise<number> {
  try {
    // We call the *new* cached version here
    const { extrinsics } = await fetchExtrinsicsList({
      address,
      order: "asc",
      page: 0,
      row: 1, // Only need the very first one
    });
    if (!extrinsics || !extrinsics.length) return 0;

    const firstTsMs = extrinsics[0].block_timestamp * 1000;
    const ageMs = Date.now() - firstTsMs;
    return Math.floor(ageMs / (1000 * 60 * 60 * 24));
  } catch (err: any) {
    logger.error("fetchAccountAgeDays failed", { address, err });
    // Re-throw the error, as it might already be an HttpError from the wrapped function
    throw err;
  }
}

async function _fetchAccountDetailsByAddress(address: string): Promise<any> {
  try {
    // Subscan endpoint: /v2/scan/search (full URL: https://polkadot.api.subscan.io/api/v2/scan/search)
    const res = await subscanRequest(`/v2/scan/search`, { key: address });
    if (!res || !res.data) {
      throw new HttpError(404, "Account details not found");
    }
    // Return full response so apiUserService can access res.data.account
    logger.info('Subscan account details fetched', {
      address,
      hasAccount: !!res.data.account,
      display: res.data.account?.display
    });
    return res;
  } catch (err: any) {
    logger.error("fetchAccountDetailsByAddress failed", { address, err });
    throw new HttpError(
      err.status || 500,
      `Account details fetch error: ${err.message}`
    );
  }
}

// ====================================================================================
// EXPORTS (Exporting the cached versions of the functions)
// ====================================================================================

export const fetchBalanceHistory = withCache(
  _fetchBalanceHistory,
  "fetchBalanceHistory"
);
export const fetchAccountTokenList = withCache(
  _fetchAccountTokenList,
  "fetchAccountTokenList"
);
export const fetchStakingRewardSum = withCache(
  _fetchStakingRewardSum,
  "fetchStakingRewardSum"
);
export const fetchTransfersList = withCache(
  _fetchTransfersList,
  "fetchTransfersList"
);
export const fetchEventsList = withCache(_fetchEventsList, "fetchEventsList");
export const fetchNominatorInfo = withCache(
  _fetchNominatorInfo,
  "fetchNominatorInfo"
);
export const fetchVotedValidatorsList = withCache(
  _fetchVotedValidatorsList,
  "fetchVotedValidatorsList"
);
export const fetchAccountRewardSlashList = withCache(
  _fetchAccountRewardSlashList,
  "fetchAccountRewardSlashList"
);
export const fetchExtrinsicsList = withCache(
  _fetchExtrinsicsList,
  "fetchExtrinsicsList"
);
export const fetchReferendaVotes = withCache(
  _fetchReferendaVotes,
  "fetchReferendaVotes"
);
export const fetchAccountAgeDays = withCache(
  _fetchAccountAgeDays,
  "fetchAccountAgeDays"
);

export const fetchAccountDetailsByAddress = withCache(
  _fetchAccountDetailsByAddress,
  "fetchAccountDetailsByAddress"
);
