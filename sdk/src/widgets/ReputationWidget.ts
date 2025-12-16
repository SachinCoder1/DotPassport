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
   * Fetch reputation scores from API
   */
  protected async fetchData(): Promise<UserScores> {
    return await this.client.getScores(this.config.address);
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
      categories,
      showCategories,
      maxCategories,
      compact,
      theme: this.getTheme(),
    });
  }
}
