import LabelsModalComponent, {
  collapseDuplicateEditLabelsDialogs,
  isEditLabelsModalVisible,
  visibleEditLabelsDialogs,
} from '@/components/shared/labels-modal-component';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

/** Open the console resource summary “Labels” editor (link or button). */
export async function openResourceLabelsEditor(page: Page): Promise<void> {
  const labels = new LabelsModalComponent(page);
  await labels.openFromResourceSummaryAndWait();
}

/** Escape-close every Edit labels dialog, then open a single fresh one. */
async function ensureSingleEditLabelsModal(page: Page): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    if (!(await isEditLabelsModalVisible(page))) {
      break;
    }
    await page.keyboard.press('Escape').catch(() => undefined);
    await page.waitForTimeout(150);
  }
  await collapseDuplicateEditLabelsDialogs(page);
  if (!(await isEditLabelsModalVisible(page))) {
    await openResourceLabelsEditor(page);
  }
  await collapseDuplicateEditLabelsDialogs(page);
}

export async function fillLabelsModalInput(page: Page, label: string): Promise<void> {
  const labels = new LabelsModalComponent(page);
  await ensureSingleEditLabelsModal(page);
  await labels.waitForOpen();

  const [key, ...rest] = label.split('=');
  const value = rest.join('=');
  // Always the topmost Edit labels dialog (duplicates steal focus from .first()).
  const modalRoot = () => visibleEditLabelsDialogs(page).last();
  const labelCommitted = async (): Promise<boolean> => {
    const root = modalRoot();
    if (await root.getByText(label, { exact: true }).isVisible().catch(() => false)) {
      return true;
    }
    if (
      !!key &&
      !!value &&
      (await root.getByText(key, { exact: true }).isVisible().catch(() => false)) &&
      (await root.getByText(value, { exact: true }).isVisible().catch(() => false))
    ) {
      return true;
    }
    // Chip may use a slash separator in the a11y tree (key/value).
    return root.getByText(`${key}/${value}`, { exact: true }).isVisible().catch(() => false);
  };
  await pollUntil(
    async () => {
      if ((await visibleEditLabelsDialogs(page).count().catch(() => 0)) !== 1) {
        await ensureSingleEditLabelsModal(page);
        return false;
      }
      if (await labelCommitted()) {
        return true;
      }
      const root = modalRoot();
      // Row-based plugin editor (data-test label-key-input) — Save persists rows, not chips.
      const addLabel = root.getByRole('button', { name: /Add label/i }).first();
      const keyInput = root.getByTestId('label-key-input').last().locator('input');
      if (
        (await keyInput.isVisible().catch(() => false)) ||
        (await addLabel.isVisible().catch(() => false))
      ) {
        if (!(await keyInput.isVisible().catch(() => false))) {
          await addLabel.click({ force: true }).catch(() => undefined);
        }
        const keyField = root.getByTestId('label-key-input').last().locator('input');
        if (await keyField.isVisible().catch(() => false)) {
          await keyField.fill(key);
          if (value) {
            const valueInput = root.getByTestId('label-value-input').last().locator('input');
            if (await valueInput.isVisible().catch(() => false)) {
              await valueInput.fill(value);
            }
          }
          return true;
        }
      }

      // Console SelectorInput — topmost dialog only (no `.or()` chains).
      const tagsInput = root
        .locator('#tags-input, [data-test="tags-input"], input[placeholder="app=frontend"]')
        .first();
      if (!(await tagsInput.isVisible().catch(() => false))) {
        return false;
      }
      if (await tagsInput.isDisabled().catch(() => false)) {
        return false;
      }
      await tagsInput.click({ force: true }).catch(() => undefined);
      await tagsInput.fill('');
      await tagsInput.fill(label).catch(() => undefined);
      // Enter or comma commits chip into labels[]; without a chip Save drops the typed buffer.
      await tagsInput.press('Enter', { timeout: 5_000 }).catch(() => undefined);
      await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      if (await labelCommitted()) {
        return true;
      }
      await tagsInput.press(',', { timeout: 5_000 }).catch(() => undefined);
      await page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      return labelCommitted();
    },
    {
      message: 'Edit labels input should accept and commit label text',
      timeout: TestTimeouts.LONG_OPERATION,
    },
  );

  if (await isEditLabelsModalVisible(page)) {
    await labels.save();
  }
  await visibleEditLabelsDialogs(page)
    .first()
    .waitFor({ state: 'hidden', timeout: TestTimeouts.LONG_OPERATION })
    .catch(() => undefined);
}

/** Open the console resource summary “Annotations” editor (link in description list). */
export async function openResourceAnnotationsEditor(page: Page): Promise<void> {
  await pollUntil(
    async () =>
      !(await page
        .locator('main progressbar, main .pf-v6-c-spinner, main .pf-c-spinner')
        .first()
        .isVisible()
        .catch(() => false)),
    {
      message: 'Resource detail should finish loading before opening annotations',
      timeout: TestTimeouts.LONG_OPERATION,
    },
  );

  const annotationsRow = page
    .locator(
      '.pf-v6-c-description-list__group, .pf-v5-c-description-list__group, .pf-c-description-list__group',
    )
    .filter({
      has: page
        .getByRole('button', { name: /^Annotations$/i })
        .or(page.getByText('Annotations', { exact: true })),
    });
  const openers = [
    annotationsRow.getByRole('button', { name: /\d+ annotations?/i }),
    annotationsRow.getByRole('link', { name: /\d+ Annotation/i }),
    annotationsRow.getByRole('button', { name: /^Edit$/i }),
    annotationsRow.getByRole('link', { name: /^Edit$/i }),
    page.getByRole('button', { name: /\d+ annotations?/i }),
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
  const pencil = annotationsRow
    .locator('[aria-label="Edit"], a, button')
    .filter({ hasText: /Edit/i });
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
