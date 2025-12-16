// Client exports
export { DotPassportClient, DotPassportError } from './client';
export type { DotPassportConfig } from './client';
export * from './types';

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
