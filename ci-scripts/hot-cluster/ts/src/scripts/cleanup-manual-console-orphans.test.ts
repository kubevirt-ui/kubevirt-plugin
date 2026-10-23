import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cleanupManualConsoleOrphans,
  escapeHelmFilter,
  resolveInstanceArtifacts,
  type OcRunner,
  type RunIgnoreResult,
} from './cleanup-manual-console-orphans';

const ok = (): RunIgnoreResult => ({ ok: true });
const fail = (error: string): RunIgnoreResult => ({ error, ok: false });

describe('resolveInstanceArtifacts', () => {
  it('derives ImageStream, BuildConfig, and Helm release from the instance key', () => {
    assert.deepEqual(resolveInstanceArtifacts('pr-4950'), {
      buildConfig: 'kubevirt-plugin-pr-4950-build',
      helmRelease: 'manual-console-pr-4950',
      imageStream: 'kubevirt-plugin-pr-4950',
    });
  });
});

describe('escapeHelmFilter', () => {
  it('escapes regex metacharacters in the release name', () => {
    assert.equal(escapeHelmFilter('manual-console-pr-4950'), 'manual-console-pr-4950');
    assert.equal(escapeHelmFilter('foo.bar'), 'foo\\.bar');
  });
});

describe('cleanupManualConsoleOrphans', () => {
  it('deletes only artifacts that currently exist', () => {
    const calls: string[] = [];
    const runner: OcRunner = {
      runIgnore: (bin, args) => {
        calls.push(`ignore:${bin} ${args.join(' ')}`);
        return ok();
      },
      runSafe: (bin, args) => {
        calls.push(`safe:${bin} ${args.join(' ')}`);
        const key = `${bin} ${args.join(' ')}`;
        if (key.includes('get namespace manual-console')) {
          return 'namespace/manual-console';
        }
        if (key.includes('get imagestream kubevirt-plugin-pr-4950')) {
          return 'imagestream.image.openshift.io/kubevirt-plugin-pr-4950';
        }
        if (key.includes('get buildconfig kubevirt-plugin-pr-4950-build')) {
          return 'buildconfig.build.openshift.io/kubevirt-plugin-pr-4950-build';
        }
        if (key.startsWith('helm list')) {
          assert.ok(args.includes('--filter'));
          assert.ok(args.includes('^manual-console-pr-4950$'));
          assert.ok(args.includes('--max'));
          assert.ok(args.includes('10000'));
          assert.ok(args.includes('--pending'));
          return 'manual-console-pr-4950';
        }
        return '';
      },
    };

    const result = cleanupManualConsoleOrphans('manual-console', 'pr-4950', runner);

    assert.deepEqual(result.cleaned, [
      'imagestream.image.openshift.io/kubevirt-plugin-pr-4950',
      'buildconfig.build.openshift.io/kubevirt-plugin-pr-4950-build',
      'helmrelease/manual-console-pr-4950',
    ]);
    assert.deepEqual(result.failed, []);
    assert.ok(
      calls.some((c) =>
        c.includes('ignore:oc delete imagestream kubevirt-plugin-pr-4950 -n manual-console'),
      ),
    );
    assert.ok(
      calls.some((c) =>
        c.includes(
          'ignore:oc delete buildconfig kubevirt-plugin-pr-4950-build -n manual-console',
        ),
      ),
    );
    assert.ok(
      calls.some((c) =>
        c.includes('ignore:helm uninstall manual-console-pr-4950 -n manual-console --wait'),
      ),
    );
  });

  it('is a no-op when the namespace is missing', () => {
    const deletes: string[] = [];
    const runner: OcRunner = {
      runIgnore: (bin, args) => {
        deletes.push(`${bin} ${args.join(' ')}`);
        return ok();
      },
      runSafe: () => '',
    };

    const result = cleanupManualConsoleOrphans('manual-console', 'pr-4950', runner);

    assert.deepEqual(result, { cleaned: [], failed: [] });
    assert.deepEqual(deletes, []);
  });

  it('is a no-op when the namespace exists but nothing matches the instance', () => {
    const deletes: string[] = [];
    const runner: OcRunner = {
      runIgnore: (bin, args) => {
        deletes.push(`${bin} ${args.join(' ')}`);
        return ok();
      },
      runSafe: (bin, args) => {
        if (bin === 'oc' && args[0] === 'get' && args[1] === 'namespace') {
          return 'namespace/manual-console';
        }
        return '';
      },
    };

    const result = cleanupManualConsoleOrphans('manual-console', 'pr-4950', runner);

    assert.deepEqual(result, { cleaned: [], failed: [] });
    assert.deepEqual(deletes, []);
  });

  it('does not uninstall when the filtered helm list is empty', () => {
    const deletes: string[] = [];
    const runner: OcRunner = {
      runIgnore: (bin, args) => {
        deletes.push(`${bin} ${args.join(' ')}`);
        return ok();
      },
      runSafe: (bin, args) => {
        if (bin === 'oc' && args[0] === 'get' && args[1] === 'namespace') {
          return 'namespace/manual-console';
        }
        if (bin === 'helm' && args[0] === 'list') {
          return '';
        }
        return '';
      },
    };

    const result = cleanupManualConsoleOrphans('manual-console', 'pr-4950', runner);

    assert.deepEqual(result, { cleaned: [], failed: [] });
    assert.deepEqual(deletes, []);
  });

  it('records failed deletes, continues, and only lists successful removals as cleaned', () => {
    const runner: OcRunner = {
      runIgnore: (bin, args) => {
        if (bin === 'oc' && args.includes('imagestream')) {
          return fail('imagestream is terminating');
        }
        return ok();
      },
      runSafe: (bin, args) => {
        const key = `${bin} ${args.join(' ')}`;
        if (key.includes('get namespace')) {
          return 'namespace/manual-console';
        }
        if (key.includes('get imagestream')) {
          return 'imagestream.image.openshift.io/kubevirt-plugin-pr-4950';
        }
        if (key.includes('get buildconfig')) {
          return 'buildconfig.build.openshift.io/kubevirt-plugin-pr-4950-build';
        }
        if (key.startsWith('helm list')) {
          return 'manual-console-pr-4950';
        }
        return '';
      },
    };

    const result = cleanupManualConsoleOrphans('manual-console', 'pr-4950', runner);

    assert.deepEqual(result.cleaned, [
      'buildconfig.build.openshift.io/kubevirt-plugin-pr-4950-build',
      'helmrelease/manual-console-pr-4950',
    ]);
    assert.deepEqual(result.failed, [
      {
        error: 'imagestream is terminating',
        resource: 'imagestream.image.openshift.io/kubevirt-plugin-pr-4950',
      },
    ]);
  });

  it('lets lookup failures propagate from runSafe', () => {
    const runner: OcRunner = {
      runIgnore: () => ok(),
      runSafe: () => {
        throw new Error('oc: connection refused');
      },
    };

    assert.throws(
      () => cleanupManualConsoleOrphans('manual-console', 'pr-4950', runner),
      /connection refused/,
    );
  });
});
