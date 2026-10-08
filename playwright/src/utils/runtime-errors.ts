import { writeFile } from 'fs/promises';

import type { BrowserContext, ConsoleMessage, TestInfo, WebError } from '@playwright/test';

/** Collect before navigation; context events also cover popups and child frames. */
export function collectRuntimeErrors(
  context: BrowserContext,
  testInfo: TestInfo,
): () => Promise<void> {
  const entries: string[] = [];
  const maxEntries = 500;
  let omitted = 0;

  const record = (kind: string, url: string, details: string) => {
    if (entries.length >= maxEntries) {
      omitted++;
      return;
    }
    // Indented code blocks preserve arbitrary console text without breaking Markdown fences.
    const text = `${url || '(page URL unavailable)'}\n${details}`;
    entries.push(
      `## ${kind} — ${new Date().toISOString()}\n\n${text
        .split('\n')
        .map((line) => `    ${line}`)
        .join('\n')}`,
    );
  };

  const onWebError = (event: WebError) => {
    const error = event.error();
    record('Uncaught JavaScript error', event.page()?.url() ?? '', error.stack || error.message);
  };
  const onConsole = (message: ConsoleMessage) => {
    if (message.type() !== 'error') return;
    const location = message.location();
    const source = location.url
      ? `\nSource: ${location.url}:${location.lineNumber + 1}:${location.columnNumber + 1}`
      : '';
    record('console.error', message.page()?.url() ?? '', `${message.text()}${source}`);
  };

  context.on('weberror', onWebError);
  context.on('console', onConsole);

  return async () => {
    // The normal context is reused by the worker: never leak listeners into the next test.
    context.off('weberror', onWebError);
    context.off('console', onConsole);

    const report = [
      '# Browser runtime errors',
      `Test: ${testInfo.titlePath.join(' > ')}`,
      `Project: ${testInfo.project.name}\n\nRetry: ${testInfo.retry}`,
      'Captured uncaught JavaScript errors and console.error messages during this test, including setup navigation.',
      entries.length ? entries.join('\n\n') : 'No browser runtime errors were captured.',
      ...(omitted ? [`${omitted} additional entries omitted (limit: ${maxEntries}).`] : []),
    ].join('\n\n');
    const artifactPath = testInfo.outputPath('runtime-errors.md');
    await writeFile(artifactPath, `${report}\n`, 'utf8');
    await testInfo.attach('runtime-errors.md', {
      path: artifactPath,
      contentType: 'text/markdown',
    });
  };
}
