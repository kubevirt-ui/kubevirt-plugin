/**
 * Base class for page objects (main-style). Extends BaseComponent with no scenario context on 4.12.
 */

import BaseComponent from '@/components/shared/base-component';
import type { Page } from '@playwright/test';

export default class BasePage extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }
}
