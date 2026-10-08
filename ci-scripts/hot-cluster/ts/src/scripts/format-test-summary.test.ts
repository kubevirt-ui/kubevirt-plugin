import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatTestSummary, parseJUnitSummary } from './format-test-summary';

const buildSuite = (
  attrs: { hostname: string; name: string },
  cases: string,
): string =>
  `<testsuite name="${attrs.name}" hostname="${attrs.hostname}" tests="1" failures="0" skipped="0" time="1.0" errors="0">${cases}</testsuite>`;

const ALL_PASSING_XML = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites id="" name="" tests="2" failures="0" skipped="0" errors="0" time="5.0">
  ${buildSuite(
    { hostname: 'Tier1', name: 'create-vm/foo.spec.ts' },
    `
    <testcase name="Foo suite › test one" classname="create-vm/foo.spec.ts" time="2.0"></testcase>
    <testcase name="Foo suite › test two" classname="create-vm/foo.spec.ts" time="3.0"></testcase>
  `,
  )}
</testsuites>`;

// One failing spec, one fully-passing spec, one skip-only spec, and a spec
// sharing the same relative path under a different project (to prove the
// project/path reconstruction disambiguates them).
const MIXED_XML = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites id="" name="" tests="6" failures="1" skipped="1" errors="0" time="20.0">
  ${buildSuite(
    { hostname: 'Tier1', name: 'create-vm/wizard-customization.spec.ts' },
    `
    <testcase name="VM Wizard › boot order persists" classname="create-vm/wizard-customization.spec.ts" time="4.0">
      <failure message="expect(received).toBeGreaterThan(expected)&#10;Expected: &gt; 0" type="expect.toBeGreaterThan"><![CDATA[stack trace here]]></failure>
    </testcase>
  `,
  )}
  ${buildSuite(
    { hostname: 'Tier1', name: 'create-vm/wizard-draft-reset.spec.ts' },
    `
    <testcase name="VM Wizard › draft resets" classname="create-vm/wizard-draft-reset.spec.ts" time="2.0"></testcase>
  `,
  )}
  ${buildSuite(
    { hostname: 'Tier2', name: 'create-vm/wizard-clone.spec.ts' },
    `
    <testcase name="VM Wizard › clone skipped" classname="create-vm/wizard-clone.spec.ts" time="0">
      <skipped/>
    </testcase>
  `,
  )}
</testsuites>`;

describe('parseJUnitSummary', () => {
  it('parses an all-passing suite with totals derived from testcases', () => {
    const summary = parseJUnitSummary(ALL_PASSING_XML);
    assert.equal(summary.total, 2);
    assert.equal(summary.failed, 0);
    assert.equal(summary.passed, 2);
    assert.equal(summary.skipped, 0);
    assert.equal(summary.specs.length, 1);
    assert.equal(summary.specs[0].path, 'tier1/create-vm/foo.spec.ts');
  });

  it('reconstructs spec paths by prefixing the lowercased project name', () => {
    const summary = parseJUnitSummary(MIXED_XML);
    const paths = summary.specs.map((spec) => spec.path);
    assert.deepEqual(paths, [
      'tier1/create-vm/wizard-customization.spec.ts',
      'tier1/create-vm/wizard-draft-reset.spec.ts',
      'tier2/create-vm/wizard-clone.spec.ts',
    ]);
  });

  it('classifies failed, passed, and skipped testcases per spec', () => {
    const summary = parseJUnitSummary(MIXED_XML);
    assert.equal(summary.failed, 1);
    assert.equal(summary.passed, 1);
    assert.equal(summary.skipped, 1);

    const [failedSpec, passedSpec, skippedSpec] = summary.specs;
    assert.equal(failedSpec.failed, 1);
    assert.equal(failedSpec.failures[0].name, 'VM Wizard › boot order persists');
    assert.match(failedSpec.failures[0].message, /expect\(received\)/);

    assert.equal(passedSpec.passed, 1);
    assert.equal(passedSpec.failed, 0);

    assert.equal(skippedSpec.skipped, 1);
    assert.equal(skippedSpec.passed, 0);
    assert.equal(skippedSpec.failed, 0);
  });

  it('returns an empty summary when there are no testsuites', () => {
    const summary = parseJUnitSummary('<testsuites></testsuites>');
    assert.equal(summary.total, 0);
    assert.equal(summary.specs.length, 0);
  });

  it('treats a Playwright <error> element as a failure (thrown errors, not just expect() assertions)', () => {
    // Playwright's JUnit reporter emits <error>, not <failure>, for any
    // thrown error whose message doesn't match an expect(...) assertion --
    // e.g. a plain `throw new Error(...)` timeout. See classifyResultError
    // in playwright/lib/reporters/junit.js.
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites id="" name="" tests="1" failures="0" skipped="0" errors="1" time="480.0">
  ${buildSuite(
    { hostname: 'Tier2', name: 'create-vm/wizard-clone.spec.ts' },
    '<testcase name="clone reaches Running state" classname="create-vm/wizard-clone.spec.ts" time="480.0"><error message="VM pw-clone-src did not become Running within 480000ms" type="Error"><![CDATA[stack trace here]]></error></testcase>',
  )}
</testsuites>`;

    const summary = parseJUnitSummary(xml);
    assert.equal(summary.failed, 1);
    assert.equal(summary.passed, 0);
    assert.equal(summary.specs[0].failures[0].message, 'VM pw-clone-src did not become Running within 480000ms');
  });

  it('ignores markup-like text inside a CDATA block when classifying a testcase', () => {
    // A passing test's logged stdout could itself contain text that looks
    // like a <failure>/<skipped> tag (e.g. a test printing HTML or XML). It
    // must not be mistaken for an actual sibling element.
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites id="" name="" tests="1" failures="0" skipped="0" errors="0" time="1.0">
  ${buildSuite(
    { hostname: 'Tier1', name: 'create-vm/logs-html.spec.ts' },
    '<testcase name="logs raw html" classname="create-vm/logs-html.spec.ts" time="0.1"><system-out><![CDATA[<failure message="not real" type="Error"></failure><skipped></skipped>]]></system-out></testcase>',
  )}
</testsuites>`;

    const summary = parseJUnitSummary(xml);
    assert.equal(summary.failed, 0);
    assert.equal(summary.skipped, 0);
    assert.equal(summary.passed, 1);
  });
});

describe('formatTestSummary', () => {
  it('returns an empty string when there are no specs', () => {
    assert.equal(formatTestSummary(parseJUnitSummary('<testsuites></testsuites>')), '');
  });

  it('shows a Passed section (no Failed section) for an all-passing run', () => {
    const markdown = formatTestSummary(parseJUnitSummary(ALL_PASSING_XML));
    assert.match(markdown, /\*\*0\*\* of \*\*2\*\* tests failed, \*\*2\*\* passed/);
    assert.ok(!markdown.includes('### Failed'));
    assert.match(markdown, /### Passed/);
    assert.match(markdown, /`tier1\/create-vm\/foo\.spec\.ts`/);
  });

  it('groups Failed/Passed/Skipped sections by spec path', () => {
    const markdown = formatTestSummary(parseJUnitSummary(MIXED_XML));

    assert.match(markdown, /\*\*1\*\* of \*\*3\*\* tests failed, \*\*1\*\* passed, 1 skipped/);

    assert.match(markdown, /### Failed\n- `tier1\/create-vm\/wizard-customization\.spec\.ts`/);
    assert.match(markdown, /VM Wizard › boot order persists — expect\(received\)/);

    assert.match(markdown, /### Passed\n- `tier1\/create-vm\/wizard-draft-reset\.spec\.ts`/);

    assert.match(markdown, /### Skipped\n- `tier2\/create-vm\/wizard-clone\.spec\.ts`/);
  });

  it('lists every failing spec path even when failure details are capped', () => {
    const suites = Array.from({ length: 30 }, (_unused, index) =>
      buildSuite(
        { hostname: 'Tier1', name: `create-vm/spec-${index}.spec.ts` },
        `<testcase name="test ${index}" classname="create-vm/spec-${index}.spec.ts" time="0.1"><failure message="boom ${index}" type="Error"/></testcase>`,
      ),
    ).join('');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites id="" name="" tests="30" failures="30" skipped="0" errors="0" time="1.0">
  ${suites}
</testsuites>`;

    const markdown = formatTestSummary(parseJUnitSummary(xml));
    assert.match(markdown, /and 5 more failing tests/);
    assert.ok(markdown.includes('`tier1/create-vm/spec-29.spec.ts`'));
    assert.ok(!markdown.includes('test 29'));
    assert.ok(markdown.includes('test 24'));
  });

  it('caps the number of displayed failing tests and notes the overflow', () => {
    const manyFailuresXml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites id="" name="" tests="30" failures="30" skipped="0" errors="0" time="1.0">
  ${buildSuite(
    { hostname: 'Tier1', name: 'create-vm/many-failures.spec.ts' },
    Array.from(
      { length: 30 },
      (_unused, index) =>
        `<testcase name="test ${index}" classname="create-vm/many-failures.spec.ts" time="0.1"><failure message="boom ${index}" type="Error"/></testcase>`,
    ).join(''),
  )}
</testsuites>`;

    const markdown = formatTestSummary(parseJUnitSummary(manyFailuresXml));
    assert.match(markdown, /and 5 more failing tests/);
    assert.ok(!markdown.includes('test 29'));
    assert.ok(markdown.includes('test 24'));
  });

  it('prepends an Environment section when run metadata is provided', () => {
    const markdown = formatTestSummary(parseJUnitSummary(ALL_PASSING_XML), {
      cnvChannel: 'stable',
      cnvPinVersion: '4.21',
      cnvVersion: 'v1.4.0',
      clusterName: 'kubevirt-plugin-ci',
      consoleImage: 'quay.io/openshift/origin-console:5.0',
      consoleRoute: 'https://ci-env-123-console.apps.example.com',
      gitSha: 'abc1234',
      infrastructureType: 'vpc',
      openshiftClusterVersion: '4.21.5',
      openshiftVersion: '4.21_openshift',
      prNumber: '4567',
      prUrl: 'https://github.com/org/repo/pull/4567',
      testEngine: 'playwright',
      testNamespace: 'kubevirt-plugin-ci-test-123',
      testProject: 'gating',
      workflowRunLabel: '#99',
      workflowRunUrl: 'https://github.com/org/repo/actions/runs/99',
    });

    assert.match(markdown, /### Environment/);
    assert.match(markdown, /\| Workflow \| \[#99\]\(https:\/\/github\.com\/org\/repo\/actions\/runs\/99\) \|/);
    assert.match(markdown, /\| Git SHA \| `abc1234` \|/);
    assert.match(markdown, /\| PR \| \[#4567\]/);
    assert.match(markdown, /\| Cluster \| `kubevirt-plugin-ci` \|/);
    assert.match(markdown, /\| Infrastructure \| `vpc` \|/);
    assert.match(markdown, /\| OpenShift \(target\) \| `4\.21_openshift` \|/);
    assert.match(markdown, /\| OpenShift \(cluster\) \| `4\.21\.5` \|/);
    assert.match(markdown, /\| CNV channel \| `stable` \|/);
    assert.match(markdown, /\| KubeVirt \(cluster\) \| `v1\.4\.0` \|/);
    assert.match(markdown, /\| Console image \| `quay\.io\/openshift\/origin-console:5\.0` \|/);
    assert.match(markdown, /### Passed/);
  });

  it('omits the Environment section when no run metadata is provided', () => {
    const markdown = formatTestSummary(parseJUnitSummary(ALL_PASSING_XML));
    assert.ok(!markdown.includes('### Environment'));
  });

  it('sanitizes newlines and backticks in failing test names and messages', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites id="" name="" tests="1" failures="1" skipped="0" errors="0" time="1.0">
  ${buildSuite(
    { hostname: 'Tier1', name: 'create-vm/weird.spec.ts' },
    '<testcase name="uses `backticks`" classname="create-vm/weird.spec.ts" time="0.1"><failure message="line one&#10;line two" type="Error"/></testcase>',
  )}
</testsuites>`;

    const markdown = formatTestSummary(parseJUnitSummary(xml));
    assert.ok(!markdown.includes('`backticks`'));
    assert.ok(!markdown.includes('line one\nline two'));
    assert.match(markdown, /line one line two/);
  });
});
