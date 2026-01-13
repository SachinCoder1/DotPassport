import { BaseWidget } from './base/BaseWidget';
import { ProfileWidgetConfig } from './base/types';
import { UserProfile } from '../types';
import { renderProfileTemplate } from './templates/profile';

/**
 * Profile Widget
 * Displays user's profile information
 */
export class ProfileWidget extends BaseWidget<ProfileWidgetConfig, UserProfile> {
  /**
   * Fetch profile from API using consolidated widget endpoint
   */
  protected async fetchData(): Promise<UserProfile> {
    return await this.client.getWidgetProfile(this.config.address, this.getAbortSignal());
  }

  /**
   * Get widget type for logging
   */
  protected getWidgetType(): string {
    return 'profile';
  }

  /**
   * Render the profile widget
   */
  protected render(): string {
    if (!this.state.data) {
      return '';
    }

    const {
      showIdentities = true,
      showSocials = true,
      showBio = true,
    } = this.config;

    return renderProfileTemplate({
      profile: this.state.data,
      showIdentities,
      showSocials,
      showBio,
      theme: this.getTheme(),
    });
  }
}
