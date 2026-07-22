/**
 * Parse Playwright JUnit XML (results.xml) and produce a markdown summary
 * of failed tests. Designed to be embedded in a GitHub check-run summary.
 */

const decode = (s: string): string =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#10;/g, ' ')
    .replace(/&#13;/g, '');

const attr = (el: string, name: string): string => {
  const m = el.match(new RegExp(name + '="([^"]*)"'));
  return m ? decode(m[1]) : '';
};

export type TestFailure = {
  name: string;
  suite: string;
  message: string;
};

export type JUnitSummary = {
  total: number;
  failed: number;
  passed: number;
  skipped: number;
  failures: TestFailure[];
};

/** Parse JUnit XML string into a structured summary. */
export const parseJUnitXml = (xml: string): JUnitSummary => {
  const root = xml.match(/<testsuites[^>]*>/);
  const total = root ? Number(attr(root[0], 'tests')) || 0 : 0;
  const failed = root ? Number(attr(root[0], 'failures')) || 0 : 0;
  const skipped = root ? Number(attr(root[0], 'skipped')) || 0 : 0;
  const passed = total - failed - skipped;

  const failures: TestFailure[] = [];
  const re = /<testcase\s+([\s\S]*?)>([\s\S]*?)<\/testcase>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    if (!m[2].includes('<failure')) continue;
    const failTag = m[2].match(/<failure\s+([\s\S]*?)(?:\/>|>[\s\S]*?<\/failure>)/);
    failures.push({
      name: attr(m[1], 'name'),
      suite: attr(m[1], 'classname'),
      message: failTag ? attr(failTag[1], 'message') : '',
    });
  }

  return { total, failed, passed, skipped, failures };
};

const MAX_FAILURES_DISPLAYED = 25;
const MAX_SUMMARY_LENGTH = 60_000;

/** Format a JUnit summary as a markdown table suitable for a check-run summary. */
export const formatFailureSummary = (summary: JUnitSummary): string => {
  if (summary.failures.length === 0) return '';

  let out = `**${summary.failed}** of **${summary.total}** tests failed, **${summary.passed}** passed`;
  if (summary.skipped > 0) out += `, ${summary.skipped} skipped`;
  out += '\n\n| Test | Error |\n| --- | --- |\n';

  for (const f of summary.failures.slice(0, MAX_FAILURES_DISPLAYED)) {
    const name = f.name.replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const msg = f.message.replace(/\|/g, '\\|').replace(/\n/g, ' ').substring(0, 200);
    out += `| ${name} | ${msg} |\n`;
  }

  if (summary.failures.length > MAX_FAILURES_DISPLAYED) {
    out += `\n_...and ${summary.failures.length - MAX_FAILURES_DISPLAYED} more failures (see workflow artifacts for full report)_\n`;
  }

  if (out.length > MAX_SUMMARY_LENGTH) {
    out = out.substring(0, MAX_SUMMARY_LENGTH) + '\n\n_...truncated_\n';
  }

  return out;
};
