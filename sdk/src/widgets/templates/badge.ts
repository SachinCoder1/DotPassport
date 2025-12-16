import { UserBadge } from '../../types';
import { formatDate } from '../base/utils';
import { getWidgetStyles } from './styles';

export interface BadgeTemplateOptions {
  badges: UserBadge[];
  maxBadges: number;
  showProgress: boolean;
  theme: 'light' | 'dark';
  isSingle: boolean;
}

/**
 * Render the badge widget template
 */
export function renderBadgeTemplate(options: BadgeTemplateOptions): string {
  const { badges, maxBadges, showProgress, theme, isSingle } = options;

  const badgesToShow = isSingle ? badges.slice(0, 1) : badges.slice(0, maxBadges);

  return `
    <div class="dp-widget dp-badge-widget dp-theme-${theme}">
      <style>${getWidgetStyles()}</style>
      ${renderBadgeGrid(badgesToShow, showProgress)}
    </div>
  `;
}

/**
 * Render the badge grid
 */
function renderBadgeGrid(badges: UserBadge[], showProgress: boolean): string {
  if (badges.length === 0) {
    return `
      <div class="dp-text-center">
        <p style="color: var(--dp-text-secondary);">No badges earned yet</p>
      </div>
    `;
  }

  const badgesHtml = badges.map((badge) => renderBadgeItem(badge, showProgress)).join('');

  return `
    <div class="dp-badge-grid">
      ${badgesHtml}
    </div>
  `;
}

/**
 * Render a single badge item
 */
function renderBadgeItem(badge: UserBadge, showProgress: boolean): string {
  return `
    <div class="dp-badge-item">
      <div class="dp-badge-icon">
        ${getBadgeIcon(badge.achievedLevel)}
      </div>
      <div class="dp-badge-title">${escapeHtml(badge.achievedLevelTitle)}</div>
      <div class="dp-badge-level">Level ${badge.achievedLevel}</div>
      ${showProgress ? `<div class="dp-badge-date">${formatDate(badge.earnedAt)}</div>` : ''}
    </div>
  `;
}

/**
 * Get badge icon based on level
 */
function getBadgeIcon(level: number): string {
  // Simple emoji icons based on level
  if (level >= 5) return '🏆';
  if (level >= 4) return '🥇';
  if (level >= 3) return '🥈';
  if (level >= 2) return '🥉';
  return '🎖️';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
