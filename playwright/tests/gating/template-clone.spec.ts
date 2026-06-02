import { SHORT_TIMEOUT } from 'utils/constants';

import { expect } from '@playwright/test';

import { test } from '../../fixtures';

const RHEL9 = 'rhel9-server-small';

/**
 * Clone template modal — verify modal state when opened from different entry points.
 */
test.describe('Clone template modal', () => {
  test('Clone from kebab action on a specific template has source template pre-selected', async ({
    page,
    templatesPage,
  }) => {
    await templatesPage.navigate();
    await templatesPage.openRowMenu(RHEL9);
    await templatesPage.selectKebabAction('Clone');
    await templatesPage.expectCloneModalVisible();

    await expect(page.getByText('Source template project')).toHaveCount(0);

    const sourceTemplateToggle = templatesPage.sourceTemplateToggle;
    await expect(sourceTemplateToggle).toContainText(RHEL9, { timeout: SHORT_TIMEOUT });
    await expect(sourceTemplateToggle).toBeDisabled();

    await expect(templatesPage.saveButton).toBeEnabled();

    await templatesPage.closeCloneModal();
  });
});
