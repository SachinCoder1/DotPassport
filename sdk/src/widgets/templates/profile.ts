import { UserProfile } from '../../types';
import { truncate } from '../base/utils';
import { getWidgetStyles } from './styles';

export interface ProfileTemplateOptions {
  profile: UserProfile;
  showIdentities: boolean;
  showSocials: boolean;
  showBio: boolean;
  theme: 'light' | 'dark';
}

/**
 * Render the profile widget template
 */
export function renderProfileTemplate(options: ProfileTemplateOptions): string {
  const { profile, showIdentities, showSocials, showBio, theme } = options;

  return `
    <div class="dp-widget dp-profile-widget dp-theme-${theme}">
      <style>${getWidgetStyles()}</style>
      ${renderProfileHeader(profile)}
      ${showBio && profile.bio ? renderBio(profile.bio) : ''}
      ${showSocials && profile.socialLinks ? renderSocials(profile.socialLinks) : ''}
      ${showIdentities && profile.polkadotIdentities ? renderIdentities(profile.polkadotIdentities) : ''}
    </div>
  `;
}

/**
 * Render profile header
 */
function renderProfileHeader(profile: UserProfile): string {
  const displayName = profile.displayName || 'Anonymous';
  const avatarUrl = profile.avatarUrl || '';

  return `
    <div class="dp-profile-header">
      ${avatarUrl ? `<img src="${escapeHtml(avatarUrl)}" class="dp-profile-avatar" alt="Profile" />` : '<div class="dp-profile-avatar"></div>'}
      <div class="dp-profile-info">
        <div class="dp-profile-name">${escapeHtml(displayName)}</div>
        <div class="dp-profile-address">${escapeHtml(truncate(profile.address, 16))}</div>
      </div>
    </div>
  `;
}

/**
 * Render bio section
 */
function renderBio(bio: string): string {
  return `
    <div class="dp-profile-bio">
      ${escapeHtml(bio)}
    </div>
  `;
}

/**
 * Get social media platform URL
 */
function getSocialUrl(platform: string, value: string): string {
  // If value is already a full URL, return it as-is
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  // Map platform names to their URL patterns
  const platformMappings: Record<string, string> = {
    twitter: 'https://twitter.com/',
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/in/',
    discord: 'https://discord.com/users/',
    telegram: 'https://t.me/',
    instagram: 'https://instagram.com/',
    reddit: 'https://reddit.com/u/',
    facebook: 'https://facebook.com/',
    youtube: 'https://youtube.com/@',
  };

  const baseUrl = platformMappings[platform.toLowerCase()];
  return baseUrl ? `${baseUrl}${value}` : value;
}

/**
 * Render social links
 */
function renderSocials(socialLinks: Record<string, string>): string {
  const links = Object.entries(socialLinks);

  if (links.length === 0) {
    return '';
  }

  const socialsHtml = links
    .map(([platform, value]) => `
      <a href="${escapeHtml(getSocialUrl(platform, value))}" class="dp-social-link" target="_blank" rel="noopener">
        ${escapeHtml(capitalizeFirst(platform))}
      </a>
    `)
    .join('');

  return `
    <div class="dp-profile-socials">
      ${socialsHtml}
    </div>
  `;
}

/**
 * Render Polkadot identities
 */
function renderIdentities(identities: any[]): string {
  if (identities.length === 0) {
    return '';
  }

  return `
    <div class="dp-mt-md">
      <div style="font-size: 0.75rem; color: var(--dp-text-secondary); margin-bottom: 0.5rem;">
        Polkadot Identities
      </div>
      ${identities.map(id => `
        <div style="font-size: 0.875rem; color: var(--dp-text-primary);">
          ${escapeHtml(id.display || id.address)}
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
