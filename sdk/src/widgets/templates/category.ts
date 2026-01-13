import { SpecificCategoryScore } from '../../types';
import { formatNumber } from '../base/utils';
import { getWidgetStyles } from './styles';

export interface CategoryTemplateOptions {
  categoryData: SpecificCategoryScore;
  showTitle: boolean;
  showDescription: boolean;
  showBreakdown: boolean;
  showAdvice: boolean;
  showScoreOnly: boolean;
  compact: boolean;
  theme: 'light' | 'dark';
}

/**
 * Render the category widget template
 */
export function renderCategoryTemplate(options: CategoryTemplateOptions): string {
  const { categoryData, showTitle, showDescription, showBreakdown, showAdvice, showScoreOnly, compact, theme } = options;

  // If showScoreOnly is true, render minimal view with just score and optionally title
  if (showScoreOnly) {
    return `
      <div class="dp-widget dp-category-widget dp-theme-${theme}${compact ? ' dp-compact' : ''}" style="${compact ? 'padding: 0.75rem;' : ''}">
        <style>${getWidgetStyles()}</style>
        ${renderScoreOnlyView(categoryData, showTitle)}
      </div>
    `;
  }

  return `
    <div class="dp-widget dp-category-widget dp-theme-${theme}${compact ? ' dp-compact' : ''}" style="${compact ? 'padding: 1rem;' : ''}">
      <style>${getWidgetStyles()}</style>
      ${renderCategoryHeader(categoryData, showTitle, showDescription)}
      ${renderCategoryScore(categoryData.category.score, compact)}
      ${showBreakdown && categoryData.definition ? renderBreakdown(categoryData.definition) : ''}
      ${showAdvice && categoryData.definition ? renderAdvice(categoryData.definition) : ''}
    </div>
  `;
}

/**
 * Render score-only minimal view
 */
function renderScoreOnlyView(data: SpecificCategoryScore, showTitle: boolean): string {
  const displayName = data.definition?.displayName || data.category.key;
  const score = data.category.score;

  return `
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
      ${showTitle ? `<div style="font-weight: 600; color: var(--dp-text-primary);">${escapeHtml(displayName)}</div>` : ''}
      <div style="display: flex; align-items: baseline; gap: 0.5rem;">
        <span style="font-size: 1.5rem; font-weight: 700; color: var(--dp-accent);">${formatNumber(score.score)}</span>
        <span style="font-size: 0.75rem; color: var(--dp-text-secondary);">${escapeHtml(score.title)}</span>
      </div>
    </div>
  `;
}

/**
 * Render category header
 */
function renderCategoryHeader(data: SpecificCategoryScore, showTitle: boolean, showDescription: boolean): string {
  if (!showTitle && !showDescription) {
    return '';
  }

  const displayName = data.definition?.displayName || data.category.key;
  const description = data.definition?.short_description || '';

  return `
    <div class="dp-category-header">
      ${showTitle ? `<div class="dp-category-name">${escapeHtml(displayName)}</div>` : ''}
      ${showDescription && description ? `<div class="dp-category-desc">${escapeHtml(description)}</div>` : ''}
    </div>
  `;
}

/**
 * Render category score
 */
function renderCategoryScore(score: any, compact: boolean): string {
  const fontSize = compact ? '2rem' : '2.5rem';
  const subtitleSize = compact ? '0.75rem' : '0.875rem';

  return `
    <div class="dp-text-center" style="${compact ? 'margin: 0.5rem 0;' : ''}">
      <div class="dp-category-score-value" style="font-size: ${fontSize};">${formatNumber(score.score)}</div>
      <div style="font-size: ${subtitleSize}; color: var(--dp-text-secondary);">
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
