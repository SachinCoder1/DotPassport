// Client exports
export { DotPassportClient, DotPassportError } from './client';
export type { DotPassportConfig } from './client';
export * from './types';

// Config exports (for environment configuration)
export {
  setDefaultBaseUrl,
  getDefaultBaseUrl,
  resetToProductionUrl,
  isLocalMode,
  LOCAL_URL,
  PRODUCTION_URL,
} from './config';

// Widget exports
export {
  createWidget,
  createReputationWidget,
  createBadgeWidget,
  createProfileWidget,
  createCategoryWidget,
  ReputationWidget,
  BadgeWidget,
  ProfileWidget,
  CategoryWidget,
  BaseWidget,
} from './widgets';

export type {
  BaseWidgetConfig,
  ReputationWidgetConfig,
  BadgeWidgetConfig,
  ProfileWidgetConfig,
  CategoryWidgetConfig,
  WidgetConfig,
  WidgetState,
} from './widgets';
