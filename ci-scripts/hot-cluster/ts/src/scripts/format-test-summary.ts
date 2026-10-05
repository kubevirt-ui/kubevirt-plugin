/**
 * Parse Playwright JUnit XML and format a spec-grouped pass/fail markdown
 * summary. Each JUnit `<testsuite>` already corresponds to one spec file
 * within one Playwright project (see playwright/lib/reporters/junit.js),
 * so no further grouping across testsuites is needed -- we only need to
 * prefix the project name back onto the testDir-relative path it reports.
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
  const match = new RegExp(`${name}="([^"]*)"`).exec(element);
  return match ? decode(match[1]) : '';
};

export type SpecFailure = {
  message: string;
  name: string;
};

export type SpecSummary = {
  failed: number;
  failures: SpecFailure[];
  passed: number;
  /** Reconstructed path, e.g. "tier1/create-vm/foo.spec.ts". */
  path: string;
  skipped: number;
};

export type JUnitSummary = {
  failed: number;
  passed: number;
  skipped: number;
  specs: SpecSummary[];
  total: number;
};

const SUITE_REGEX = /<testsuite\s+([^>]*)>([\s\S]*?)<\/testsuite>/g;
const CASE_REGEX = /<testcase\s+([^>]*)>([\s\S]*?)<\/testcase>/g;
const CDATA_REGEX = /<!\[CDATA\[[\s\S]*?\]\]>/g;
const SKIPPED_REGEX = /<skipped\s*\/?>/;
// Playwright emits <failure> for expect() assertion failures and <error> for
// any other thrown error (see classifyResultError in
// playwright/lib/reporters/junit.js) -- both mean the test failed.
const FAILURE_REGEX = /<(?:failure|error)\s+([^>]*?)(?:\/>|>[\s\S]*?<\/(?:failure|error)>)/;

/** Parse Playwright JUnit XML into one summary per spec file. */
export const parseJUnitSummary = (xml: string): JUnitSummary => {
  const specs: SpecSummary[] = [];

  for (const suiteMatch of xml.matchAll(SUITE_REGEX)) {
    const suiteAttrs = suiteMatch[1];
    const body = suiteMatch[2];
    // "hostname" is the Playwright project name (e.g. "Tier1"); "name" is
    // the spec file path relative to that project's own testDir. Combining
    // them reconstructs an unambiguous, repo-relative-ish spec path.
    const project = attr(suiteAttrs, 'hostname').toLowerCase();
    const relativePath = attr(suiteAttrs, 'name');
    const path = project ? `${project}/${relativePath}` : relativePath;

    const failures: SpecFailure[] = [];
    let passed = 0;
    let skipped = 0;

    for (const caseMatch of body.matchAll(CASE_REGEX)) {
      const caseAttrs = caseMatch[1];
      const caseBody = caseMatch[2];
      const name = attr(caseAttrs, 'name');
      // Strip CDATA text content (stack traces, diffs, stdout/stderr) before
      // classifying, so markup-like text inside a failure message or logged
      // output can't be mistaken for an actual <skipped>/<failure>/<error>
      // element.
      const structuralBody = caseBody.replace(CDATA_REGEX, '');

      if (SKIPPED_REGEX.test(structuralBody)) {
        skipped += 1;
        continue;
      }

      const failureMatch = FAILURE_REGEX.exec(structuralBody);
      if (failureMatch) {
        failures.push({ message: attr(failureMatch[1], 'message'), name });
        continue;
      }

      passed += 1;
    }

    specs.push({ failed: failures.length, failures, passed, path, skipped });
  }

  return specs.reduce<JUnitSummary>(
    (acc, spec) => ({
      failed: acc.failed + spec.failed,
      passed: acc.passed + spec.passed,
      skipped: acc.skipped + spec.skipped,
      specs: [...acc.specs, spec],
      total: acc.total + spec.failed + spec.passed + spec.skipped,
    }),
    { failed: 0, passed: 0, skipped: 0, specs: [], total: 0 },
  );
};

const MAX_FAILURES_DISPLAYED = 25;
const MAX_MESSAGE_LENGTH = 200;
const MAX_SUMMARY_LENGTH = 60_000;

const sanitizeInline = (text: string): string =>
  text.replace(/\n/g, ' ').replace(/`/g, "'").trim();

const formatHeader = (summary: JUnitSummary): string =>
  `**${summary.failed}** of **${summary.total}** tests failed, **${summary.passed}** passed` +
  (summary.skipped > 0 ? `, ${summary.skipped} skipped` : '');

const formatFailedSection = (failedSpecs: SpecSummary[]): string => {
  const lines = ['### Failed'];
  let detailsShown = 0;
  let overflow = 0;

  for (const spec of failedSpecs) {
    lines.push(`- \`${spec.path}\``);
    for (const failure of spec.failures) {
      if (detailsShown < MAX_FAILURES_DISPLAYED) {
        const name = sanitizeInline(failure.name);
        const message = sanitizeInline(failure.message).substring(0, MAX_MESSAGE_LENGTH);
        lines.push(`  - ${name}${message ? ` — ${message}` : ''}`);
        detailsShown += 1;
      } else {
        overflow += 1;
      }
    }
  }

  if (overflow > 0) {
    lines.push(
      `\n_...and ${overflow} more failing tests (see workflow artifacts for full report)_`,
    );
  }
  return lines.join('\n');
};

const formatSpecPathList = (title: string, specs: SpecSummary[]): string =>
  [`### ${title}`, ...specs.map((spec) => `- \`${spec.path}\``)].join('\n');

/** Format a parsed JUnit summary as a spec-grouped pass/fail markdown block. */
export const formatTestSummary = (summary: JUnitSummary): string => {
  if (summary.specs.length === 0) {
    return '';
  }

  const failedSpecs = summary.specs.filter((spec) => spec.failed > 0);
  const passedSpecs = summary.specs.filter((spec) => spec.failed === 0 && spec.passed > 0);
  const skippedOnlySpecs = summary.specs.filter(
    (spec) => spec.failed === 0 && spec.passed === 0 && spec.skipped > 0,
  );

  const sections = [formatHeader(summary)];
  if (failedSpecs.length > 0) {
    sections.push(formatFailedSection(failedSpecs));
  }
  if (passedSpecs.length > 0) {
    sections.push(formatSpecPathList('Passed', passedSpecs));
  }
  if (skippedOnlySpecs.length > 0) {
    sections.push(formatSpecPathList('Skipped', skippedOnlySpecs));
  }

  const out = sections.join('\n\n');
  return out.length > MAX_SUMMARY_LENGTH
    ? `${out.substring(0, MAX_SUMMARY_LENGTH)}\n\n_...truncated_`
    : out;
};
