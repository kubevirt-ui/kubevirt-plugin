import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseJUnitXml, formatFailureSummary } from './junit-parser';

const PASSING_XML = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites id="" name="" tests="3" failures="0" skipped="0" errors="0" time="10.5">
  <testsuite name="chromium" tests="3" failures="0" skipped="0" time="10.5" errors="0">
    <testcase name="test one" classname="suite.spec.ts" time="1.0"></testcase>
    <testcase name="test two" classname="suite.spec.ts" time="2.0"></testcase>
    <testcase name="test three" classname="suite.spec.ts" time="3.0"></testcase>
  </testsuite>
</testsuites>`;

const FAILING_XML = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites id="" name="" tests="5" failures="2" skipped="1" errors="0" time="30.0">
  <testsuite name="chromium" tests="5" failures="2" skipped="1" time="30.0" errors="0">
    <testcase name="passes" classname="a.spec.ts" time="1.0"></testcase>
    <testcase name="VM creation" classname="b.spec.ts" time="5.0">
      <failure message="expect(received).toBeVisible()&#10;Expected: visible" type="FAILURE"><![CDATA[stack trace here]]></failure>
    </testcase>
    <testcase name="disk attach" classname="c.spec.ts" time="60.0">
      <failure message="Timeout 60000ms exceeded" type="FAILURE"/>
    </testcase>
    <testcase name="skipped test" classname="d.spec.ts" time="0">
      <skipped/>
    </testcase>
    <testcase name="another pass" classname="e.spec.ts" time="2.0"></testcase>
  </testsuite>
</testsuites>`;

describe('parseJUnitXml', () => {
  it('parses a fully passing suite', () => {
    const result = parseJUnitXml(PASSING_XML);
    assert.equal(result.total, 3);
    assert.equal(result.failed, 0);
    assert.equal(result.passed, 3);
    assert.equal(result.skipped, 0);
    assert.equal(result.failures.length, 0);
  });

  it('parses a suite with failures and skips', () => {
    const result = parseJUnitXml(FAILING_XML);
    assert.equal(result.total, 5);
    assert.equal(result.failed, 2);
    assert.equal(result.passed, 2);
    assert.equal(result.skipped, 1);
    assert.equal(result.failures.length, 2);
    assert.equal(result.failures[0].name, 'VM creation');
    assert.match(result.failures[0].message, /expect\(received\)/);
    assert.equal(result.failures[1].name, 'disk attach');
    assert.equal(result.failures[1].message, 'Timeout 60000ms exceeded');
  });

  it('decodes XML entities in messages', () => {
    const result = parseJUnitXml(FAILING_XML);
    assert.ok(!result.failures[0].message.includes('&#10;'));
  });
});

describe('formatFailureSummary', () => {
  it('returns empty string for no failures', () => {
    const summary = { total: 3, failed: 0, passed: 3, skipped: 0, failures: [] };
    assert.equal(formatFailureSummary(summary), '');
  });

  it('formats a markdown table for failures', () => {
    const result = parseJUnitXml(FAILING_XML);
    const markdown = formatFailureSummary(result);
    assert.match(markdown, /\*\*2\*\* of \*\*5\*\* tests failed/);
    assert.match(markdown, /1 skipped/);
    assert.match(markdown, /VM creation/);
    assert.match(markdown, /disk attach/);
    assert.match(markdown, /\| Test \| Error \|/);
  });

  it('escapes pipe characters in test names', () => {
    const summary = {
      total: 1,
      failed: 1,
      passed: 0,
      skipped: 0,
      failures: [{ name: 'test|with|pipes', suite: 'a', message: 'msg|here' }],
    };
    const md = formatFailureSummary(summary);
    assert.ok(!md.includes('test|with'));
    assert.match(md, /test\\|with\\|pipes/);
  });
});
