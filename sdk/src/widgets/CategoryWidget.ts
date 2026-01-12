import { BaseWidget } from './base/BaseWidget';
import { CategoryWidgetConfig } from './base/types';
import { SpecificCategoryScore } from '../types';
import { renderCategoryTemplate } from './templates/category';

/**
 * Category Widget
 * Displays detailed breakdown of a specific category score
 */
export class CategoryWidget extends BaseWidget<CategoryWidgetConfig, SpecificCategoryScore> {
  /**
   * Fetch category score from API using consolidated widget endpoint
   */
  protected async fetchData(): Promise<SpecificCategoryScore> {
    return await this.client.getWidgetCategory(
      this.config.address,
      this.config.categoryKey,
      this.getAbortSignal()
    );
  }

  /**
   * Get widget type for logging
   */
  protected getWidgetType(): string {
    return 'category';
  }

  /**
   * Render the category widget
   */
  protected render(): string {
    if (!this.state.data) {
      return '';
    }

    const {
      showTitle = true,
      showDescription = true,
      showBreakdown = true,
      showAdvice = true,
      showScoreOnly = false,
      compact = false,
    } = this.config;

    return renderCategoryTemplate({
      categoryData: this.state.data,
      showTitle,
      showDescription,
      showBreakdown,
      showAdvice,
      showScoreOnly,
      compact,
      theme: this.getTheme(),
    });
  }
}
