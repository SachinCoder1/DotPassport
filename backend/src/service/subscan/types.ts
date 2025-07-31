export interface BalanceHistoryEntry {
  balance: string;
  block: number;
  date: string;
}

export interface BalanceHistoryResponse {
  code: number;
  data: {
    history: BalanceHistoryEntry[];
    status: string;
  };
  generated_at: number;
  message: string;
}

export interface TokenBalance {
  symbol: string;
  unique_id: string;
  decimals: number;
  balance: string;
  lock: string;
  reserved: string;
  bonded: string;
  unbonding: string;
  democracy_lock: string;
  conviction_lock: string;
  election_lock: string;
  label: string | null;
  price: string;
}

export interface TokenListResponse {
  code: number;
  message: string;
  generated_at: number;
  data: {
    native: TokenBalance[];
  };
}
export interface StakingRewardSumResponse {
  code: number;
  data: { sum: number };
  generated_at: number;
  message: string;
}

export interface Judgement {
  index: number;
  judgement: string;
}

export interface IdentityParent {
  address: string;
  display: string;
  identity: boolean;
  sub_symbol: string;
}

export interface People {
  display: string;
  identity: boolean;
  judgements?: Judgement[];
  parent?: IdentityParent;
}

export interface AccountDisplay {
  address: string;
  account_index?: string;
  display?: string;
  evm_address?: string;
  evm_contract?: {
    contract_name: string;
    verify_source: string;
  };
  identity?: boolean;
  judgements?: Judgement[];
  merkle?: {
    address_type: string;
    tag_name: string;
    tag_subtype: string;
    tag_type: string;
  };
  parent?: IdentityParent;
  people?: People;
}
export interface Transfer {
  transfer_id: number;
  from: string;
  from_account_display: AccountDisplay;
  to: string;
  to_account_display: AccountDisplay;
  extrinsic_index: string;
  success: boolean;
  hash: string;
  block_num: number;
  block_timestamp: number;
  module: string;
  amount: string;
  amount_v2: string;
  current_currency_amount: string;
  currency_amount: string;
  fee: string;
  nonce: number;
  asset_symbol: string;
  asset_unique_id: string;
  asset_type: string;
  item_id: string | null;
  event_idx: number;
  is_lock: boolean;
  item_detail?: {
    collection_symbol: string;
    fallback_image: string;
    image: string;
    local_image: string;
    media: { types: string; url: string }[];
    symbol: string;
    thumbnail: string;
  };
}

export interface TransfersListResponse {
  code: number;
  message: string;
  generated_at: number;
  data: {
    count: number;
    total?: Record<string, { sent: string; received: string; total: string }>;
    transfers: Transfer[];
  };
}

export interface ScanEvent {
  block_timestamp: number;
  event_id: string;
  event_index: string;
  extrinsic_hash: string;
  extrinsic_index: string;
  finalized: boolean;
  id: number;
  module_id: string;
  phase: number;
}

export interface EventsListResponse {
  code: number;
  message: string;
  generated_at: number;
  data: {
    count: number;
    events: ScanEvent[];
  };
}

export interface StakingInfo {
  controller: string;
  controller_display: AccountDisplay;
  reward_account: string;
  reward_display: AccountDisplay;
}

export interface NominatorInfoData {
  nominator_stash: string;
  stash_account_display: AccountDisplay;
  staking_info: StakingInfo | null;
  bonded: string;
  status: string;
}

export interface NominatorInfoResponse {
  code: number;
  message: string;
  generated_at: number;
  data: NominatorInfoData;
}

/**––– 1) Voted‑validator record type –––*/
export interface VotedValidator {
  rank_validator: number;
  bonded_nominators: string;
  bonded_owner: string;
  count_nominators: number;
  validator_prefs_value: number;
  latest_mining: number;
  reward_point: number;
  session_key: Record<string, string> | null;
  stash_account_display: AccountDisplay;
  controller_account_display: AccountDisplay | null;
  grandpa_vote: number;
  bonded_total: string;
  status: string;
  bonded: string;
  active: boolean;
  next_session_selected?: boolean;
}

export interface VotedValidatorsResponse {
  code: number;
  message: string;
  generated_at: number;
  data: {
    list: VotedValidator[] | null;
  };
}

export interface RewardSlashRecord {
  era: number;
  stash: string;
  account: string;
  validator_stash: string;
  amount: string;
  block_timestamp: number;
  event_index: string;
  module_id: string;
  event_id: string;
  extrinsic_index: string;
  invalid_era: boolean;
}

export interface RewardSlashListResponse {
  code: number;
  message: string;
  generated_at: number;
  data: {
    count: number;
    list: RewardSlashRecord[];
  };
}

export interface ExtrinsicRecord {
  id: number;
  block_num: number;
  block_timestamp: number;
  extrinsic_index: string;
  call_module_function: string;
  call_module: string;
  nonce: number;
  extrinsic_hash: string;
  success: boolean;
  fee: string;
  fee_used: string;
  tip: string;
  finalized: boolean;
  account_display: AccountDisplay;
}

export interface ExtrinsicsListResponse {
  code: number;
  message: string;
  generated_at: number;
  data: {
    count: number;
    extrinsics: ExtrinsicRecord[];
  };
}

export interface ReferendumVoteRecord {
  referendum_index: number;
  account: AccountDisplay;
  delegate_account: AccountDisplay | null;
  extrinsic_index: string;
  conviction: string;
  amount: string;
  votes: string;
  status: "Ayes" | "Nays" | "Abstains";
  valid: boolean;
  unlock_block: number;
  voting_time: number;
  relay_chain: number;
}

export interface ReferendaVotesResponse {
  code: number;
  message: string;
  generated_at: number;
  data: {
    count: number;
    list: ReferendumVoteRecord[];
  };
}





export interface SubscanJudgement {
  index: number;
  judgement: string;
}

export interface SubscanAccountData {
  address: string;
  display?: string | null;
  legal?: string | null;
  email?: string | null;
  web?: string | null;
  twitter?: string | null;
  github?: string | null;
  matrix?: string | null;
  discord?: string | null;
  judgements?: SubscanJudgement[] | null;
  role?: string | null;
  nonce?: number | null;
}

export interface SubscanApiResponse {
  code: number;
  message: string;
  data?: {
    account?: SubscanAccountData | null;
  } | null;
}