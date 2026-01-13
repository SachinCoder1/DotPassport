import { DotPassportClient, DotPassportError } from '../../client';
import { BaseWidgetConfig, WidgetState } from './types';
import { resolveContainer, resolveTheme } from './utils';
import { getWidgetStyles } from '../templates/styles';

/**
 * Abstract base class for all widgets
 * Handles lifecycle, data fetching, rendering, and error handling
 */
export abstract class BaseWidget<
  TConfig extends BaseWidgetConfig,
  TData = any
> {
  protected client: DotPassportClient;
  protected container: HTMLElement | null = null;
  protected config: TConfig;
  protected state: WidgetState<TData> = {
    loading: false,
    error: null,
    data: null,
  };
  protected abortController: AbortController | null = null;

  constructor(config: TConfig) {
    this.config = config;
    this.client = new DotPassportClient({
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
    });
    // Widgets now use consolidated /widget/:type/:address endpoints
    // No need for query parameter interceptor
  }

  /**
   * Mount the widget to a container element
   * @param selector - CSS selector string or HTMLElement
   */
  async mount(selector: string | HTMLElement): Promise<void> {
    try {
      // Cancel any previous pending requests
      this.abortController?.abort();
      this.abortController = new AbortController();

      // Resolve container
      this.container = resolveContainer(selector);

      // Add custom class if provided
      if (this.config.className) {
        this.container.classList.add(this.config.className);
      }

      // Set loading state and render
      this.state.loading = true;
      this.updateDOM();

      // Fetch data
      try {
        this.state.data = await this.fetchData();
        this.state.loading = false;
        this.state.error = null;
        this.updateDOM();

        // Call onLoad callback
        if (this.config.onLoad) {
          this.config.onLoad();
        }
      } catch (error) {
        // Ignore abort errors - they're expected when widget is unmounted
        if ((error as Error).name === 'AbortError' || (error as Error).name === 'CanceledError') {
          return;
        }

        this.state.loading = false;
        this.state.error = error as Error;
        this.updateDOM();

        // Call onError callback
        if (this.config.onError) {
          this.config.onError(error as Error);
        }
      }
    } catch (error) {
      console.error('Failed to mount widget:', error);
      throw error;
    }
  }

  /**
   * Update widget configuration and re-render
   * @param config - Partial configuration to update
   */
  async update(config: Partial<TConfig>): Promise<void> {
    const oldAddress = this.config.address;
    this.config = { ...this.config, ...config };

    // If address changed, re-fetch data
    if (config.address && config.address !== oldAddress) {
      this.state.loading = true;
      this.updateDOM();

      try {
        this.state.data = await this.fetchData();
        this.state.loading = false;
        this.state.error = null;
        this.updateDOM();

        if (this.config.onLoad) {
          this.config.onLoad();
        }
      } catch (error) {
        this.state.loading = false;
        this.state.error = error as Error;
        this.updateDOM();

        if (this.config.onError) {
          this.config.onError(error as Error);
        }
      }
    } else {
      // Just re-render with new config
      this.updateDOM();
    }
  }

  /**
   * Refresh widget data
   */
  async refresh(): Promise<void> {
    if (!this.container) {
      throw new Error('Widget not mounted');
    }

    this.state.loading = true;
    this.updateDOM();

    try {
      this.state.data = await this.fetchData();
      this.state.loading = false;
      this.state.error = null;
      this.updateDOM();

      if (this.config.onLoad) {
        this.config.onLoad();
      }
    } catch (error) {
      this.state.loading = false;
      this.state.error = error as Error;
      this.updateDOM();

      if (this.config.onError) {
        this.config.onError(error as Error);
      }
    }
  }

  /**
   * Destroy the widget and clean up
   * Cancels any pending API requests
   */
  destroy(): void {
    // Abort any pending requests
    this.abortController?.abort();
    this.abortController = null;

    if (this.container) {
      this.container.innerHTML = '';
      if (this.config.className) {
        this.container.classList.remove(this.config.className);
      }
      this.container = null;
    }

    this.state = {
      loading: false,
      error: null,
      data: null,
    };
  }

  /**
   * Unmount the widget (alias for destroy)
   * Cancels any pending API requests
   */
  unmount(): void {
    this.destroy();
  }

  /**
   * Get the AbortSignal for use in fetch operations
   * @returns AbortSignal or undefined if no controller exists
   */
  protected getAbortSignal(): AbortSignal | undefined {
    return this.abortController?.signal;
  }

  /**
   * Update the DOM with current state
   */
  protected updateDOM(): void {
    if (!this.container) return;

    if (this.state.loading) {
      this.container.innerHTML = this.renderLoading();
    } else if (this.state.error) {
      this.container.innerHTML = this.renderError();
    } else if (this.state.data) {
      try {
        this.container.innerHTML = this.render();
      } catch (renderError) {
        console.error(`[${this.getWidgetType()}Widget] Render error:`, renderError);
        this.state.error = renderError as Error;
        this.container.innerHTML = this.renderError();
      }
    }
  }

  /**
   * Render loading state
   */
  protected renderLoading(): string {
    const theme = resolveTheme(this.config.theme);
    return `
      <div class="dp-widget dp-theme-${theme}">
        <style>${getWidgetStyles()}</style>
        <div class="dp-loading">
          <div class="dp-spinner"></div>
        </div>
      </div>
    `;
  }

  /**
   * Render error state
   */
  protected renderError(): string {
    const theme = resolveTheme(this.config.theme);
    const error = this.state.error;
    // Show actual error message for all error types to help debugging
    const message = error instanceof DotPassportError
      ? error.message
      : error?.message || 'An unexpected error occurred';

    // Log error for debugging
    console.error(`[${this.getWidgetType()}Widget] Error:`, error);

    return `
      <div class="dp-widget dp-theme-${theme}">
        <style>${getWidgetStyles()}</style>
        <div class="dp-error">
          <div class="dp-error-title">Error Loading Data</div>
          <div class="dp-error-message">${this.escapeHtml(message)}</div>
        </div>
      </div>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   */
  protected escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get the resolved theme
   */
  protected getTheme(): 'light' | 'dark' {
    return resolveTheme(this.config.theme);
  }

  /**
   * Abstract method to get widget type for logging
   * Must be implemented by subclasses
   */
  protected abstract getWidgetType(): string;

  /**
   * Abstract method to fetch widget data
   * Must be implemented by subclasses
   */
  protected abstract fetchData(): Promise<TData>;

  /**
   * Abstract method to render widget content
   * Must be implemented by subclasses
   */
  protected abstract render(): string;
}
