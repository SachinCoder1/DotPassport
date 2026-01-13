import { UserBadge, BadgeDefinition } from '../../types';
import { formatDate } from '../base/utils';
import { getWidgetStyles } from './styles';

export interface BadgeTemplateOptions {
  badges: UserBadge[];
  maxBadges: number;
  showProgress: boolean;
  theme: 'light' | 'dark';
  isSingle: boolean;
  notEarned?: boolean;
  definition?: BadgeDefinition | null;
}

/**
 * Render the badge widget template
 */
export function renderBadgeTemplate(options: BadgeTemplateOptions): string {
  const { badges, maxBadges, showProgress, theme, isSingle, notEarned, definition } = options;

  // Handle "not earned" state for single badge
  if (notEarned && definition) {
    return `
      <div class="dp-widget dp-badge-widget dp-theme-${theme}">
        <style>${getWidgetStyles()}</style>
        ${renderNotEarnedBadge(definition)}
      </div>
    `;
  }

  const badgesToShow = isSingle ? badges.slice(0, 1) : badges.slice(0, maxBadges);

  return `
    <div class="dp-widget dp-badge-widget dp-theme-${theme}">
      <style>${getWidgetStyles()}</style>
      ${renderBadgeGrid(badgesToShow, showProgress)}
    </div>
  `;
}

/**
 * Render a "not earned yet" state for a single badge
 */
function renderNotEarnedBadge(definition: BadgeDefinition): string {
  const firstLevel = definition.levels?.[0];

  return `
    <div class="dp-badge-not-earned">
      <div class="dp-badge-icon dp-badge-locked">
        🔒
      </div>
      <div class="dp-badge-title">${escapeHtml(definition.title)}</div>
      <div class="dp-badge-description" style="color: var(--dp-text-secondary); font-size: 0.85rem; margin-top: 0.5rem;">
        ${escapeHtml(definition.shortDescription)}
      </div>
      <div class="dp-badge-status" style="color: var(--dp-text-muted); font-size: 0.75rem; margin-top: 0.75rem; font-style: italic;">
        Badge not yet earned
      </div>
      ${firstLevel ? `
        <div class="dp-badge-requirement" style="color: var(--dp-text-secondary); font-size: 0.75rem; margin-top: 0.5rem; padding: 0.5rem; background: var(--dp-bg-secondary); border-radius: 0.375rem;">
          <strong>First Level:</strong> ${escapeHtml(firstLevel.title)}
        </div>
      ` : ''}
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
      ${showProgress && badge.earnedAt ? `<div class="dp-badge-date">${formatDate(badge.earnedAt)}</div>` : ''}
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
function escapeHtml(text: string | undefined | null): string {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
