import { BaseWidget } from './base/BaseWidget';
import { BadgeWidgetConfig } from './base/types';
import { UserBadges, SpecificUserBadge } from '../types';
import { renderBadgeTemplate } from './templates/badge';

/**
 * Badge Widget
 * Displays user's badges earned
 */
export class BadgeWidget extends BaseWidget<
  BadgeWidgetConfig,
  UserBadges | SpecificUserBadge
> {
  /**
   * Fetch badges from API using consolidated widget endpoint
   */
  protected async fetchData(): Promise<UserBadges | SpecificUserBadge> {
    const { badgeKey } = this.config;
    const signal = this.getAbortSignal();

    // Uses consolidated widget endpoint - single API call for all badge data
    return await this.client.getWidgetBadges(this.config.address, badgeKey, signal);
  }

  /**
   * Get widget type for logging
   */
  protected getWidgetType(): string {
    return 'badge';
  }

  /**
   * Render the badge widget
   */
  protected render(): string {
    if (!this.state.data) {
      return '';
    }

    const { maxBadges = 6, showProgress = false } = this.config;

    // Check if it's a single badge or multiple badges
    const isSingleBadge = 'badge' in this.state.data;
    const badges = isSingleBadge
      ? [(this.state.data as SpecificUserBadge).badge]
      : (this.state.data as UserBadges).badges;

    return renderBadgeTemplate({
      badges,
      maxBadges,
      showProgress,
      theme: this.getTheme(),
      isSingle: isSingleBadge,
    });
  }
}
