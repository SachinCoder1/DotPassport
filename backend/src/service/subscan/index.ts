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

/**
 * Fetch native-token balance history for an address between two dates.
 * @param address Polkadot address
 * @param start ISO date string, e.g. "2024-01-02"
 * @param end   ISO date string, e.g. "2024-01-31"
 * @returns     Array of balance history entries
 */

export async function fetchBalanceHistory(
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
    // wrap or rethrow
    throw new HttpError(
      err.status || 500,
      `Balance history fetch error: ${err.message}`
    );
  }
}

/**
 * Fetch all token balances for an address (DOT + any other assets).
 * @param address Polkadot address
 * @returns       Array of token balances
 */

export async function fetchAccountTokenList(
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

/**
 * Fetch total staking rewards for an address over a given period.
 *
 * @param opts.address     Polkadot address
 * @param opts.start       ISO start date, e.g. "2023-05-01"
 * @param opts.end         ISO end date, e.g. "2023-06-01"
 * @param opts.block_range Optional block range string, e.g. "10000"
 * @returns               Total reward sum (as number)
 */

export async function fetchStakingRewardSum(opts: {
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

/**
 * Fetch the list of transfers for a given address.
 *
 * @param params.address        Polkadot address (required)
 * @param params.include_total  Whether to return per‑token sent/received totals
 * @param params.order          'asc' | 'desc' (defaults to 'desc')
 * @param params.success        Filter only successful transfers
 * @param params.page           Page number (default 0)
 * @param params.row            Rows per page (default 100)
 */
export async function fetchTransfersList(params: {
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

/**
 * Fetch the list of events for a given address.
 *
 * @param params.address         Polkadot address (required)
 * @param params.after_id        Return events after this ID
 * @param params.block_num       Only events in this block
 * @param params.block_range     Range of blocks, e.g. "1000-2000"
 * @param params.event_id        Filter by specific event ID
 * @param params.extrinsic_index Filter by extrinsic index
 * @param params.finalized       Only finalized events
 * @param params.focus           Focus field (string)
 * @param params.module          Filter by module, e.g. "balances"
 * @param params.order           'asc' | 'desc' (default 'desc')
 * @param params.page            Page number (default 0)
 * @param params.phase           Phase value (0 | 1 | 2)
 * @param params.row             Rows per page (default 100, max 100)
 */
export async function fetchEventsList(params: {
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

/**
 * Fetch staking nominator info for an address.
 *
 * @param address Polkadot address
 * @returns       Nominator stash, display info, bonded amount, status, and optional controller/reward info
 */
export async function fetchNominatorInfo(
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

/**
 * Fetch the list of validators this address has voted for.
 *
 * @param address Polkadot address
 */
export async function fetchVotedValidatorsList(
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

/**
 * Fetch the list of staking rewards and slashes for an address.
 *
 * @param params.address        Polkadot address (required)
 * @param params.block_range    Optional block range string, e.g. "10000-20000"
 * @param params.category       "Reward" | "Slash"
 * @param params.claimed_filter "unclaimed" | "claimed"
 * @param params.is_stash       true to filter by stash account
 * @param params.page           Page number (default 0)
 * @param params.row            Rows per page (default 100, max 100)
 */
export async function fetchAccountRewardSlashList(params: {
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

/**
 * Fetch extrinsics for an address, optionally filtered by module.
 *
 * @param params.address  Polkadot address (required)
 * @param params.module   e.g. "balances" | "democracy" | "staking" | "xcmpallet" | "utility"
 * @param params.success  only successful extrinsics
 * @param params.order    'asc' | 'desc' (default 'asc')
 * @param params.page     Page number (default 0)
 * @param params.row      Rows per page (default 100)
 */
export async function fetchExtrinsicsList(params: {
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

/**
 * Fetch referenda votes for a given account.
 *
 * @param params.account           Polkadot address (required)
 * @param params.order             'asc' | 'desc' (default 'desc')
 * @param params.page              Page number (default 0)
 * @param params.referendum_index  Specific referendum index
 * @param params.row               Rows per page (default 100)
 * @param params.sort              'conviction' | 'amount' | 'votes'
 * @param params.status            'Ayes' | 'Nays' | 'Abstains'
 * @param params.valid             true for valid votes only
 */
export async function fetchReferendaVotes(params: {
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

/**
 * Account Age (days)
 * Calculate how many days since the first on-chain extrinsic for an address.
 * @param address Polkadot address
 * @returns       Number of days since first extrinsic (0 if none)
 */
export async function fetchAccountAgeDays(address: string): Promise<number> {
  try {
    const { extrinsics } = await fetchExtrinsicsList({
      address,
      order: "asc",
      page: 0,
      row: 10,
    });
    if (!extrinsics.length) return 0;

    const firstTsMs = extrinsics[0].block_timestamp * 1000;
    const ageMs = Date.now() - firstTsMs;
    return Math.floor(ageMs / (1000 * 60 * 60 * 24));
  } catch (err: any) {
    logger.error("fetchAccountAgeDays failed", { address, err });
    throw new HttpError(
      err.status || 500,
      `Account age fetch error: ${err.message}`
    );
  }
}
