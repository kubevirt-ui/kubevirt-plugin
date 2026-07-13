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
    // INTENTIONALLY BROKEN for Hot Cluster CI pipeline validation -- the
    // toggle is actually disabled; this flips the assertion so the gating
    // run fails on purpose. Will be fixed in a follow-up commit.
    await expect(sourceTemplateToggle).toBeEnabled();

    await expect(templatesPage.saveButton).toBeEnabled();

    await templatesPage.closeCloneModal();
  });
});
