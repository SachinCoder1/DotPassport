export const TEST_ADDRESSES = [
  {
    label: 'Primary Test Address',
    address: '12aoZXwbUzsv3z5HF5HCrtEwBJYCeKne6rYsxFEKDZ86Wdv8'
  },
  {
    label: 'Custom Address',
    address: '' // User can enter their own
  }
];

// These will be populated dynamically from API, but provide fallbacks
export const CATEGORY_KEYS = [
  'longevity',
  'txCount',
  'governance',
  'treasury',
  'staking',
  'identity',
  'social',
  'technical'
];

export const BADGE_KEYS = [
  'relay_chain_initiate',
  'parachain_explorer',
  'governance_participant',
  'staking_master'
];

export const WIDGET_TYPES = [
  'reputation',
  'badge',
  'badges',
  'profile',
  'category'
] as const;

export const THEMES = ['light', 'dark', 'auto'] as const;
