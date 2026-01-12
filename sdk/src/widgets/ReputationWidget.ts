import { BaseWidget } from './base/BaseWidget';
import { ReputationWidgetConfig } from './base/types';
import { UserScores } from '../types';
import { renderReputationTemplate } from './templates/reputation';

/**
 * Reputation Widget
 * Displays user's total reputation score and category breakdown
 */
export class ReputationWidget extends BaseWidget<ReputationWidgetConfig, UserScores> {
  /**
   * Fetch reputation scores from API using consolidated widget endpoint
   */
  protected async fetchData(): Promise<UserScores> {
    return await this.client.getWidgetReputation(this.config.address, this.getAbortSignal());
  }

  /**
   * Get widget type for logging
   */
  protected getWidgetType(): string {
    return 'reputation';
  }

  /**
   * Render the reputation widget
   */
  protected render(): string {
    if (!this.state.data) {
      return '';
    }

    const { totalScore, categories } = this.state.data;
    const {
      showCategories = true,
      maxCategories = 6,
      compact = false,
    } = this.config;

    return renderReputationTemplate({
      totalScore,
      categories: categories || {},
      showCategories,
      maxCategories,
      compact,
      theme: this.getTheme(),
    });
  }
}
