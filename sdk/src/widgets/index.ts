/**
 * DotPassport SDK Widgets
 * Framework-agnostic embeddable widgets for displaying reputation data
 */

import { WidgetConfig } from './base/types';
import { ReputationWidget } from './ReputationWidget';
import { BadgeWidget } from './BadgeWidget';
import { ProfileWidget } from './ProfileWidget';
import { CategoryWidget } from './CategoryWidget';

/**
 * Factory function to create a widget based on configuration
 * @param config - Widget configuration
 * @returns Widget instance
 */
export function createWidget(config: WidgetConfig) {
  const type = config.type || 'reputation';

  switch (type) {
    case 'reputation':
      return new ReputationWidget(config as any);
    case 'badge':
    case 'badges':
      return new BadgeWidget(config as any);
    case 'profile':
      return new ProfileWidget(config as any);
    case 'category':
      return new CategoryWidget(config as any);
    default:
      throw new Error(`Unknown widget type: ${(config as any).type}`);
  }
}

/**
 * Create a reputation widget (tree-shakeable)
 */
export function createReputationWidget(
  config: Omit<WidgetConfig & { type?: 'reputation' }, 'type'>
) {
  return new ReputationWidget(config);
}

/**
 * Create a badge widget (tree-shakeable)
 */
export function createBadgeWidget(
  config: Omit<WidgetConfig & { type: 'badge' | 'badges' }, 'type'>
) {
  return new BadgeWidget({ ...config, type: 'badge' });
}

/**
 * Create a profile widget (tree-shakeable)
 */
export function createProfileWidget(
  config: Omit<WidgetConfig & { type: 'profile' }, 'type'>
) {
  return new ProfileWidget({ ...config, type: 'profile' });
}

/**
 * Create a category widget (tree-shakeable)
 */
export function createCategoryWidget(
  config: Omit<WidgetConfig & { type: 'category' }, 'type'> & { categoryKey: string }
) {
  return new CategoryWidget({ ...config, type: 'category' });
}

// Export widget classes for advanced usage
export { ReputationWidget } from './ReputationWidget';
export { BadgeWidget } from './BadgeWidget';
export { ProfileWidget } from './ProfileWidget';
export { CategoryWidget } from './CategoryWidget';

// Export types
export type {
  BaseWidgetConfig,
  ReputationWidgetConfig,
  BadgeWidgetConfig,
  ProfileWidgetConfig,
  CategoryWidgetConfig,
  WidgetConfig,
  WidgetState,
} from './base/types';

// Export base widget for advanced extension
export { BaseWidget } from './base/BaseWidget';
