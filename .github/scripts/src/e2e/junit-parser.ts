/**
 * Parse Playwright JUnit XML (results.xml) and produce a markdown summary
 * of failed tests. Designed to be embedded in a GitHub check-run summary.
 */

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

export type TestFailure = {
  message: string;
  name: string;
  suite: string;
};

export type JUnitSummary = {
  failed: number;
  failures: TestFailure[];
  passed: number;
  skipped: number;
  total: number;
};

/** Parse JUnit XML string into a structured summary. */
export const parseJUnitXml = (xml: string): JUnitSummary => {
  const root = /<testsuites[^>]*>/.exec(xml);
  const total = root ? Number(attr(root[0], 'tests')) || 0 : 0;
  const failed = root ? Number(attr(root[0], 'failures')) || 0 : 0;
  const skipped = root ? Number(attr(root[0], 'skipped')) || 0 : 0;
  const passed = total - failed - skipped;

  const testCaseRegex = /<testcase\s+([^>]*)>([^<]*(?:<(?!\/testcase>)[^<]*)*)<\/testcase>/g;
  const failures: TestFailure[] = Array.from(xml.matchAll(testCaseRegex))
    .filter((match) => match[2].includes('<failure'))
    .map((match) => {
      const failTag = match[2].match(
        /<failure\s+([^>]*?)(?:\/>|>[^<]*(?:<(?!\/failure>)[^<]*)*<\/failure>)/,
      );
      return {
        message: failTag ? attr(failTag[1], 'message') : '',
        name: attr(match[1], 'name'),
        suite: attr(match[1], 'classname'),
      };
    });

  return { failed, failures, passed, skipped, total };
};

const MAX_FAILURES_DISPLAYED = 25;
const MAX_SUMMARY_LENGTH = 60_000;

/** Format a JUnit summary as a markdown table suitable for a check-run summary. */
export const formatFailureSummary = (summary: JUnitSummary): string => {
  if (summary.failures.length === 0) {
    return '';
  }

  const header =
    `**${summary.failed}** of **${summary.total}** tests failed, **${summary.passed}** passed` +
    (summary.skipped > 0 ? `, ${summary.skipped} skipped` : '');

  const rows = summary.failures.slice(0, MAX_FAILURES_DISPLAYED).map((failure) => {
    const name = failure.name.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const msg = failure.message.replace(/\|/g, '\\|').replace(/\n/g, ' ').substring(0, 200);
    return `| ${name} | ${msg} |`;
  });

  const overflow =
    summary.failures.length > MAX_FAILURES_DISPLAYED
      ? `\n_...and ${summary.failures.length - MAX_FAILURES_DISPLAYED} more failures (see workflow artifacts for full report)_\n`
      : '';

  const out = [header, '\n\n| Test | Error |\n| --- | --- |\n', rows.join('\n'), overflow].join('');

  return out.length > MAX_SUMMARY_LENGTH
    ? out.substring(0, MAX_SUMMARY_LENGTH) + '\n\n_...truncated_\n'
    : out;
};
