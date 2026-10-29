import LabelsModalComponent, { editLabelsDialog } from '@/components/shared/labels-modal-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

/** Open the console resource summary “Labels” editor (link or button). */
export async function openResourceLabelsEditor(page: Page): Promise<void> {
  const labels = new LabelsModalComponent(page);
  await labels.openFromResourceSummaryAndWait();
}

export async function fillLabelsModalInput(page: Page, label: string): Promise<void> {
  const labels = new LabelsModalComponent(page);
  await labels.waitForOpen();
  const dialog = editLabelsDialog(page);

  const legacyInDialog = dialog.locator('#tags-input, [data-test="tags-input"]');
  const consoleLabelTextbox = dialog
    .getByPlaceholder('app=frontend')
    .or(dialog.getByRole('textbox').first());
  if (await legacyInDialog.isVisible().catch(() => false)) {
    await legacyInDialog.fill(label);
    await legacyInDialog.press('Enter');
    await labels.save();
    return;
  }
  if (await consoleLabelTextbox.isVisible().catch(() => false)) {
    await consoleLabelTextbox.fill(label);
    await consoleLabelTextbox.press('Enter');
    await labels.save();
    await dialog
      .waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION })
      .catch(() => undefined);
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
  await labels.save();
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
