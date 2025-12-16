/**
 * Base configuration for all widgets
 */
export interface BaseWidgetConfig {
  /** API key for authentication */
  apiKey: string;
  /** Polkadot address to display data for */
  address: string;
  /** Optional base URL for API (defaults to production) */
  baseUrl?: string;
  /** Theme for the widget */
  theme?: 'light' | 'dark' | 'auto';
  /** Additional CSS class name */
  className?: string;
  /** Callback fired when an error occurs */
  onError?: (error: Error) => void;
  /** Callback fired when data is loaded */
  onLoad?: () => void;
}

/**
 * Configuration for Reputation Widget
 */
export interface ReputationWidgetConfig extends BaseWidgetConfig {
  type?: 'reputation';
  /** Show category breakdown */
  showCategories?: boolean;
  /** Maximum number of categories to display */
  maxCategories?: number;
  /** Compact mode (smaller height) */
  compact?: boolean;
}

/**
 * Configuration for Badge Widget
 */
export interface BadgeWidgetConfig extends BaseWidgetConfig {
  type: 'badge' | 'badges';
  /** Badge key (for single badge display) */
  badgeKey?: string;
  /** Maximum number of badges to display (for badges list) */
  maxBadges?: number;
  /** Show progress to next level */
  showProgress?: boolean;
}

/**
 * Configuration for Profile Widget
 */
export interface ProfileWidgetConfig extends BaseWidgetConfig {
  type: 'profile';
  /** Show Polkadot identities */
  showIdentities?: boolean;
  /** Show social links */
  showSocials?: boolean;
  /** Show bio */
  showBio?: boolean;
}

/**
 * Configuration for Category Widget
 */
export interface CategoryWidgetConfig extends BaseWidgetConfig {
  type: 'category';
  /** Category key to display */
  categoryKey: string;
  /** Show score breakdown/reasons */
  showBreakdown?: boolean;
  /** Show advice for improvement */
  showAdvice?: boolean;
}

/**
 * Union type of all widget configurations
 */
export type WidgetConfig =
  | ReputationWidgetConfig
  | BadgeWidgetConfig
  | ProfileWidgetConfig
  | CategoryWidgetConfig;

/**
 * Internal widget state
 */
export interface WidgetState<TData = any> {
  loading: boolean;
  error: Error | null;
  data: TData | null;
}
