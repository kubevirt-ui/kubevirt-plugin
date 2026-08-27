import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import BaseComponent from './base-component';

export default class TableExportComponent extends BaseComponent {
  private readonly _exportButton = this.testId('export-table-csv');

  constructor(page: Page) {
    super(page);
  }

  async downloadCsvExport(): Promise<{ content: string; filename: string }> {
    await this._exportButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    const downloadPromise = this.page.waitForEvent('download');
    await this.robustClick(this._exportButton);
    const download = await downloadPromise;

    const failure = await download.failure();
    if (failure) {
      throw new Error(`CSV download failed: ${failure}`);
    }

    const filename = download.suggestedFilename();
    const dir = await mkdtemp(join(tmpdir(), 'kubevirt-csv-'));
    try {
      const filePath = join(dir, filename || 'export.csv');
      await download.saveAs(filePath);
      const content = await readFile(filePath, 'utf-8');
      return { content, filename };
    } finally {
      await rm(dir, { force: true, recursive: true });
    }
  }
}
