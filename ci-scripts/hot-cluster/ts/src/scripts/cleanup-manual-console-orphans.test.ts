import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cleanupManualConsoleOrphans,
  escapeHelmFilter,
  helmListAllStatusesArgs,
  isHelmPermissionError,
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

describe('isHelmPermissionError', () => {
  it('matches only secrets-access RBAC denials, not generic auth failures', () => {
    assert.equal(
      isHelmPermissionError(
        'secrets is forbidden: User "system:serviceaccount:arc-runners:x" cannot list resource "secrets"',
      ),
      true,
    );
    assert.equal(
      isHelmPermissionError(
        'Error: uninstall: failed to delete: secret "sh.helm.release.v1.x.v1" is forbidden',
      ),
      true,
    );
    assert.equal(isHelmPermissionError('Error from server (Unauthorized)'), false);
    assert.equal(
      isHelmPermissionError(
        'Error from server (Forbidden): deployments.apps "console" is forbidden',
      ),
      false,
    );
    assert.equal(isHelmPermissionError('connection refused'), false);
  });
});

describe('helmListAllStatusesArgs', () => {
  it('filters by release, raises max, and requests every status', () => {
    const args = helmListAllStatusesArgs('manual-console', 'manual-console-pr-4950');
    assert.ok(args.includes('--filter'));
    assert.ok(args.includes('^manual-console-pr-4950$'));
    assert.ok(args.includes('--max'));
    assert.ok(args.includes('10000'));
    for (const flag of [
      '--deployed',
      '--failed',
      '--pending',
      '--superseded',
      '--uninstalling',
      '--uninstalled',
    ]) {
      assert.ok(args.includes(flag), `missing ${flag}`);
    }
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

  it('skips helm on Forbidden and still returns ImageStream/BuildConfig cleanup', () => {
    const runner: OcRunner = {
      runIgnore: () => ok(),
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
          const err = new Error('Command failed: helm list') as Error & { stderr: string };
          err.stderr =
            'Error: list: failed to list: secrets is forbidden: User "system:serviceaccount:arc-runners:x" cannot list resource "secrets"';
          throw err;
        }
        return '';
      },
    };

    const result = cleanupManualConsoleOrphans('manual-console', 'pr-4950', runner);

    assert.deepEqual(result.cleaned, [
      'imagestream.image.openshift.io/kubevirt-plugin-pr-4950',
      'buildconfig.build.openshift.io/kubevirt-plugin-pr-4950-build',
    ]);
    assert.deepEqual(result.failed, []);
  });

  it('records non-permission helm list failures without aborting prior deletes', () => {
    const runner: OcRunner = {
      runIgnore: () => ok(),
      runSafe: (bin, args) => {
        const key = `${bin} ${args.join(' ')}`;
        if (key.includes('get namespace')) {
          return 'namespace/manual-console';
        }
        if (key.includes('get imagestream')) {
          return 'imagestream.image.openshift.io/kubevirt-plugin-pr-4950';
        }
        if (key.startsWith('helm list')) {
          throw new Error('connection refused');
        }
        return '';
      },
    };

    const result = cleanupManualConsoleOrphans('manual-console', 'pr-4950', runner);

    assert.deepEqual(result.cleaned, [
      'imagestream.image.openshift.io/kubevirt-plugin-pr-4950',
    ]);
    assert.equal(result.failed.length, 1);
    assert.equal(result.failed[0]?.resource, 'helmrelease/manual-console-pr-4950');
    assert.match(result.failed[0]?.error ?? '', /connection refused/);
  });

  it('warns on secrets-RBAC helm uninstall without adding to failed', () => {
    const runner: OcRunner = {
      runIgnore: (bin, args) => {
        if (bin === 'helm' && args[0] === 'uninstall') {
          return fail(
            'Error: uninstall: Secret "sh.helm.release.v1.manual-console-pr-4950.v1" is forbidden',
          );
        }
        return ok();
      },
      runSafe: (bin, args) => {
        const key = `${bin} ${args.join(' ')}`;
        if (key.includes('get namespace')) {
          return 'namespace/manual-console';
        }
        if (key.startsWith('helm list')) {
          return 'manual-console-pr-4950';
        }
        return '';
      },
    };

    const result = cleanupManualConsoleOrphans('manual-console', 'pr-4950', runner);

    assert.deepEqual(result.cleaned, []);
    assert.deepEqual(result.failed, []);
  });

  it('records non-secrets helm uninstall failures (e.g. chart resource deletes)', () => {
    const runner: OcRunner = {
      runIgnore: (bin, args) => {
        if (bin === 'helm' && args[0] === 'uninstall') {
          return fail(
            'Error from server (Forbidden): deployments.apps "console" is forbidden',
          );
        }
        return ok();
      },
      runSafe: (bin, args) => {
        const key = `${bin} ${args.join(' ')}`;
        if (key.includes('get namespace')) {
          return 'namespace/manual-console';
        }
        if (key.startsWith('helm list')) {
          return 'manual-console-pr-4950';
        }
        return '';
      },
    };

    const result = cleanupManualConsoleOrphans('manual-console', 'pr-4950', runner);

    assert.deepEqual(result.cleaned, []);
    assert.equal(result.failed.length, 1);
    assert.equal(result.failed[0]?.resource, 'helmrelease/manual-console-pr-4950');
    assert.match(result.failed[0]?.error ?? '', /deployments\.apps/);
  });

  it('lets oc lookup failures propagate from runSafe', () => {
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
