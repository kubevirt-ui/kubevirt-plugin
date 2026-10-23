import LabelsModalComponent from '@/components/shared/labels-modal-component';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

/** Open the console resource summary “Labels” editor (link or button). */
export async function openResourceLabelsEditor(page: Page): Promise<void> {
  const labels = new LabelsModalComponent(page);
  await labels.openFromResourceSummary();
}

function editLabelsDialog(page: Page): Locator {
  return page
    .getByRole('dialog')
    .filter({ has: page.getByRole('heading', { name: /^Edit labels$/i }) })
    .first();
}

export async function fillLabelsModalInput(page: Page, label: string): Promise<void> {
  const labels = new LabelsModalComponent(page);
  const legacy = page.locator('#tags-input, [data-test="tags-input"]');
  const dialog = editLabelsDialog(page);

  await pollUntil(
    async () =>
      (await legacy.isVisible().catch(() => false)) ||
      (await dialog.isVisible().catch(() => false)),
    {
      message: 'Edit labels editor should be visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    },
  );

  if (await legacy.isVisible().catch(() => false)) {
    await labels.fillLegacyTagsInputAndSave(label);
    return;
  }

  const [key, ...rest] = label.split('=');
  const value = rest.join('=');
  if (key) {
    await labels.addLabelRow();
    await labels.fillNewLabelKey(key);
    if (value) {
      const valueInput = dialog.getByTestId('label-value-input').last().locator('input');
      if (await valueInput.isVisible().catch(() => false)) {
        await valueInput.fill(value);
      }
    }
  }
  await dialog.getByTestId('save-button').click();
}

/** Open the console resource summary “Annotations” editor (link in description list). */
export async function openResourceAnnotationsEditor(page: Page): Promise<void> {
  const annotationsRow = page
    .locator('.pf-c-description-list__group, .pf-v6-c-description-list__group')
    .filter({ has: page.getByText('Annotations', { exact: true }) });
  await annotationsRow.first().waitFor({ state: 'visible' });
  const openers = [
    annotationsRow.getByRole('link', { name: /\d+ Annotation/i }),
    annotationsRow.getByRole('link', { name: /^Edit$/i }),
    annotationsRow.getByRole('button', { name: /^Edit$/i }),
    page.getByRole('link', { name: /\d+ Annotation/i }),
    page.getByRole('button', { name: /edit annotations/i }),
  ];
  for (const opener of openers) {
    const target = opener.first();
    if (await target.isVisible().catch(() => false)) {
      await target.click();
      return;
    }
  }
  const pencil = annotationsRow.locator('[aria-label="Edit"], a').filter({ hasText: /Edit/i });
  if (
    await pencil
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await pencil.first().click();
    return;
  }
  throw new Error('Could not find Annotations editor control on resource summary');
}
