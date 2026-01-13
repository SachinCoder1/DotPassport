import { CategoryScore } from '../../types';
import { formatNumber } from '../base/utils';
import { getWidgetStyles } from './styles';

export interface ReputationTemplateOptions {
  totalScore: number;
  categories: Record<string, CategoryScore>;
  showCategories: boolean;
  maxCategories: number;
  compact: boolean;
  theme: 'light' | 'dark';
}

/**
 * Render the reputation widget template
 */
export function renderReputationTemplate(options: ReputationTemplateOptions): string {
  const {
    totalScore,
    categories,
    showCategories,
    maxCategories,
    compact,
    theme,
  } = options;

  const compactClass = compact ? 'dp-compact' : '';

  return `
    <div class="dp-widget dp-reputation-widget dp-theme-${theme} ${compactClass}">
      <style>${getWidgetStyles()}</style>
      ${renderScoreHeader(totalScore)}
      ${showCategories ? renderCategories(categories, maxCategories) : ''}
    </div>
  `;
}

/**
 * Render the score header section
 */
function renderScoreHeader(totalScore: number): string {
  return `
    <div class="dp-score-header">
      <div class="dp-score-value">${formatNumber(totalScore)}</div>
      <div class="dp-score-label">Reputation Score</div>
    </div>
  `;
}

/**
 * Render the categories section
 */
function renderCategories(
  categories: Record<string, CategoryScore>,
  maxCategories: number
): string {
  const entries = Object.entries(categories).slice(0, maxCategories);

  if (entries.length === 0) {
    return '';
  }

  const categoriesHtml = entries
    .map(([key, category]) => renderCategoryItem(category))
    .join('');

  return `
    <div class="dp-categories">
      ${categoriesHtml}
    </div>
  `;
}

/**
 * Render a single category item
 */
function renderCategoryItem(category: CategoryScore): string {
  return `
    <div class="dp-category-item">
      <span class="dp-category-title">${escapeHtml(category.title)}</span>
      <span class="dp-category-score">${formatNumber(category.score)}</span>
    </div>
  `;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
