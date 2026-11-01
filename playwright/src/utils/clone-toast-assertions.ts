import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

import { TestTimeouts } from '@/utils/test-config';

type AlertVariant = 'danger' | 'info' | 'success';

const alertVariantSelector = (variant: AlertVariant): string =>
  `.pf-v6-c-alert.pf-m-${variant}, .pf-v5-c-alert.pf-m-${variant}, .pf-c-alert.pf-m-${variant}`;

const cloneToastTitle = (targetVmName: string, variant: AlertVariant): string => {
  if (variant === 'success') {
    return 'Clone completed';
  }
  return `Clone virtual machine - ${targetVmName}`;
};

export const expectCloneToast = (
  page: Page,
  variant: AlertVariant,
  targetVmName: string,
  timeout = TestTimeouts.DEFAULT,
) => {
  const toast = page
    .locator(alertVariantSelector(variant))
    .filter({ hasText: cloneToastTitle(targetVmName, variant) });
  return expect(toast).toBeVisible({ timeout });
};

export const expectCloneModalHidden = (page: Page) =>
  expect(page.getByTestId('dialog-modal').filter({ hasText: /Clone/i })).toBeHidden({
    timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
  });
