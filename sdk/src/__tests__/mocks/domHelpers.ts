/**
 * DOM testing utilities
 */

/**
 * Create a container element for widget testing
 */
export function createTestContainer(id = 'test-container'): HTMLElement {
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  const container = document.createElement('div');
  container.id = id;
  document.body.appendChild(container);
  return container;
}

/**
 * Remove test container after tests
 */
export function removeTestContainer(id = 'test-container'): void {
  const container = document.getElementById(id);
  if (container) {
    container.remove();
  }
}

/**
 * Wait for DOM updates (useful for async rendering)
 */
export function waitForDomUpdate(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Query widget elements by class
 */
export function queryWidgetElement(
  container: HTMLElement,
  className: string
): HTMLElement | null {
  return container.querySelector(`.${className}`);
}

/**
 * Check if widget shows loading state
 */
export function isWidgetLoading(container: HTMLElement): boolean {
  return container.querySelector('.dp-loading') !== null;
}

/**
 * Check if widget shows error state
 */
export function isWidgetError(container: HTMLElement): boolean {
  return container.querySelector('.dp-error') !== null;
}

/**
 * Get error message from widget
 */
export function getWidgetErrorMessage(container: HTMLElement): string | null {
  const errorEl = container.querySelector('.dp-error-message');
  return errorEl?.textContent || null;
}

/**
 * Wait for widget to finish loading (loading indicator disappears)
 */
export async function waitForWidgetLoad(
  container: HTMLElement,
  timeout = 5000
): Promise<void> {
  const startTime = Date.now();
  while (isWidgetLoading(container)) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Widget loading timeout');
    }
    await waitForDomUpdate();
  }
}
