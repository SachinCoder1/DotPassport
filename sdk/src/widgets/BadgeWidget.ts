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
   * Fetch badges from API
   */
  protected async fetchData(): Promise<UserBadges | SpecificUserBadge> {
    const { badgeKey } = this.config;

    if (badgeKey) {
      // Fetch specific badge
      return await this.client.getBadge(this.config.address, badgeKey);
    } else {
      // Fetch all badges
      return await this.client.getBadges(this.config.address);
    }
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
