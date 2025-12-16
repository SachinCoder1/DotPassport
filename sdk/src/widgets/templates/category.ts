import { SpecificCategoryScore } from '../../types';
import { formatNumber } from '../base/utils';
import { getWidgetStyles } from './styles';

export interface CategoryTemplateOptions {
  categoryData: SpecificCategoryScore;
  showBreakdown: boolean;
  showAdvice: boolean;
  theme: 'light' | 'dark';
}

/**
 * Render the category widget template
 */
export function renderCategoryTemplate(options: CategoryTemplateOptions): string {
  const { categoryData, showBreakdown, showAdvice, theme } = options;

  return `
    <div class="dp-widget dp-category-widget dp-theme-${theme}">
      <style>${getWidgetStyles()}</style>
      ${renderCategoryHeader(categoryData)}
      ${renderCategoryScore(categoryData.category.score)}
      ${showBreakdown && categoryData.definition ? renderBreakdown(categoryData.definition) : ''}
      ${showAdvice && categoryData.definition ? renderAdvice(categoryData.definition) : ''}
    </div>
  `;
}

/**
 * Render category header
 */
function renderCategoryHeader(data: SpecificCategoryScore): string {
  const displayName = data.definition?.displayName || data.category.key;
  const description = data.definition?.short_description || '';

  return `
    <div class="dp-category-header">
      <div class="dp-category-name">${escapeHtml(displayName)}</div>
      ${description ? `<div class="dp-category-desc">${escapeHtml(description)}</div>` : ''}
    </div>
  `;
}

/**
 * Render category score
 */
function renderCategoryScore(score: any): string {
  return `
    <div class="dp-text-center">
      <div class="dp-category-score-value">${formatNumber(score.score)}</div>
      <div style="font-size: 0.875rem; color: var(--dp-text-secondary);">
        ${escapeHtml(score.title)}
      </div>
    </div>
  `;
}

/**
 * Render breakdown/reasons
 */
function renderBreakdown(definition: any): string {
  if (!definition.reasons || definition.reasons.length === 0) {
    return '';
  }

  const breakdownItems = definition.reasons
    .slice(0, 3) // Show top 3 reasons
    .map(
      (reason: any) => `
      <div class="dp-breakdown-item">
        <div class="dp-breakdown-item-title">${escapeHtml(reason.title)}</div>
        <div class="dp-breakdown-item-desc">${escapeHtml(reason.description)}</div>
      </div>
    `
    )
    .join('');

  return `
    <div class="dp-breakdown">
      <div class="dp-breakdown-title">Score Breakdown</div>
      ${breakdownItems}
    </div>
  `;
}

/**
 * Render advice for improvement
 */
function renderAdvice(definition: any): string {
  if (!definition.reasons || definition.reasons.length === 0) {
    return '';
  }

  const advices = definition.reasons
    .flatMap((reason: any) => reason.advices || [])
    .slice(0, 2); // Show top 2 pieces of advice

  if (advices.length === 0) {
    return '';
  }

  return `
    <div class="dp-mt-md">
      <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--dp-text-primary);">
        Tips for Improvement
      </div>
      <ul style="margin: 0; padding-left: 1.25rem; color: var(--dp-text-secondary); font-size: 0.875rem;">
        ${advices.map((advice: string) => `<li>${escapeHtml(advice)}</li>`).join('')}
      </ul>
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
