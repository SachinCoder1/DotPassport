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
   * Fetch category score from API
   */
  protected async fetchData(): Promise<SpecificCategoryScore> {
    return await this.client.getCategoryScore(
      this.config.address,
      this.config.categoryKey
    );
  }

  /**
   * Render the category widget
   */
  protected render(): string {
    if (!this.state.data) {
      return '';
    }

    const {
      showBreakdown = true,
      showAdvice = true,
    } = this.config;

    return renderCategoryTemplate({
      categoryData: this.state.data,
      showBreakdown,
      showAdvice,
      theme: this.getTheme(),
    });
  }
}
