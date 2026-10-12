/**
 * Extract a markdown failure summary from Playwright JUnit XML results.
 * Outputs `test_summary` to GITHUB_OUTPUT.
 *
 * Required env: TEST_ENGINE
 */

import { existsSync, readFileSync } from 'node:fs';

import { setMultilineOutput, setOutput } from '../utils';

const decode = (text: string): string =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#10;/g, ' ')
    .replace(/&#13;/g, '');

const attr = (element: string, name: string): string => {
  const match = new RegExp(name + '="([^"]*)"').exec(element);
  return match ? decode(match[1]) : '';
};

const RESULTS_FILE = 'playwright/test-results/results.xml';
const MAX_FAILURES = 25;
const MAX_LENGTH = 60_000;

type Failure = { msg: string; name: string };

const extractFailure = (testcaseAttrs: string, testcaseBody: string): Failure | undefined => {
  if (!testcaseBody.includes('<failure')) {
    return undefined;
  }
  const failTag = /<failure\s+([^>]*?)(?:\/>|>[^<]*(?:<(?!\/failure>)[^<]*)*<\/failure>)/.exec(
    testcaseBody,
  );
  return {
    msg: failTag ? attr(failTag[1], 'message') : '',
    name: attr(testcaseAttrs, 'name'),
  };
};

const parseFailures = (xml: string): Failure[] => {
  const failures: Failure[] = [];
  const pattern = /<testcase\s+([^>]*)>([^<]*(?:<(?!\/testcase>)[^<]*)*)<\/testcase>/g;
  for (const match of xml.matchAll(pattern)) {
    const failure = extractFailure(match[1], match[2]);
    if (failure) {
      failures.push(failure);
    }
  }
  return failures;
};

const formatSummary = (
  total: string,
  failed: string,
  passed: string,
  skipped: string,
  failures: Failure[],
): string => {
  const header =
    `**${failed}** of **${total}** tests failed, **${passed}** passed` +
    (skipped !== '0' ? `, ${skipped} skipped` : '');
  const tableHeader = '\n\n| Test | Error |\n| --- | --- |\n';
  const rows = failures
    .slice(0, MAX_FAILURES)
    .map((failure) => {
      const name = failure.name.replace(/\|/g, '\\|').replace(/\n/g, ' ');
      const msg = failure.msg.replace(/\|/g, '\\|').replace(/\n/g, ' ').substring(0, 200);
      return `| ${name} | ${msg} |\n`;
    })
    .join('');
  const overflow =
    failures.length > MAX_FAILURES
      ? `\n_...and ${failures.length - MAX_FAILURES} more failures (see workflow artifacts for full report)_\n`
      : '';
  const assembled = header + tableHeader + rows + overflow;
  return assembled.length > MAX_LENGTH
    ? assembled.substring(0, MAX_LENGTH) + '\n\n_...truncated_\n'
    : assembled;
};

const main = async (): Promise<void> => {
  const testEngine = process.env.TEST_ENGINE ?? '';

  if (testEngine !== 'playwright' || !existsSync(RESULTS_FILE)) {
    setOutput('test_summary', '');
    return;
  }

  const xml = readFileSync(RESULTS_FILE, 'utf8');

  const root = /<testsuites[^>]*>/.exec(xml);
  const total = root ? attr(root[0], 'tests') : '?';
  const failed = root ? attr(root[0], 'failures') : '?';
  const skipped = root ? attr(root[0], 'skipped') : '0';
  const passed =
    total !== '?' && failed !== '?'
      ? String(Number(total) - Number(failed) - Number(skipped))
      : '?';

  if (failed === '0') {
    setOutput('test_summary', '');
    return;
  }

  const failures = parseFailures(xml);
  if (failures.length === 0) {
    setOutput('test_summary', '');
    return;
  }

  setMultilineOutput('test_summary', formatSummary(total, failed, passed, skipped, failures));
};

void main().catch((err) => {
  console.error(`::error::${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
