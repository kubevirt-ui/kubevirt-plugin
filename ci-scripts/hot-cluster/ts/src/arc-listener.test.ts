import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  checkArcListenerReady,
  findArcListenerPodName,
  hasUnhealthyListenerContainer,
  isPodReady,
} from './arc-listener';

const SCALE_SET_NS = 'arc-runners';

type FakeClientOptions = {
  listenerItems?: unknown[];
  pod?: unknown;
  podError?: Error;
};

const makeClient = (options: FakeClientOptions) => ({
  coreV1: {
    readNamespacedPod: async () => {
      if (options.podError) {
        throw options.podError;
      }
      return options.pod;
    },
  },
  customObjects: {
    listNamespacedCustomObject: async () => ({ items: options.listenerItems ?? [] }),
  },
});

const listenerSpec = (name: string, scaleSetName: string, scaleSetNamespace = SCALE_SET_NS) => ({
  metadata: { name },
  spec: {
    autoscalingRunnerSetName: scaleSetName,
    autoscalingRunnerSetNamespace: scaleSetNamespace,
  },
});

describe('checkArcListenerReady', () => {
  it('is not ready when no AutoscalingListener exists at all', async () => {
    const client = makeClient({ listenerItems: [] });

    const result = await checkArcListenerReady(client as never, {
      controllerNamespace: 'arc-systems',
      scaleSetName: 'kubevirt-plugin-ci',
      scaleSetNamespace: SCALE_SET_NS,
    });

    assert.equal(result.ready, false);
  });

  it('is not ready when only a different scale set has a listener', async () => {
    const client = makeClient({
      listenerItems: [listenerSpec('listener-421', 'kubevirt-plugin-421')],
    });

    const result = await checkArcListenerReady(client as never, {
      controllerNamespace: 'arc-systems',
      scaleSetName: 'kubevirt-plugin-ci',
      scaleSetNamespace: SCALE_SET_NS,
    });

    assert.equal(result.ready, false);
  });

  it('is not ready when the scale set name matches but the namespace does not', async () => {
    const client = makeClient({
      listenerItems: [listenerSpec('listener-ci', 'kubevirt-plugin-ci', 'other-runners')],
      pod: { status: { containerStatuses: [{ ready: true }], phase: 'Running' } },
    });

    const result = await checkArcListenerReady(client as never, {
      controllerNamespace: 'arc-systems',
      scaleSetName: 'kubevirt-plugin-ci',
      scaleSetNamespace: SCALE_SET_NS,
    });

    assert.equal(result.ready, false);
  });

  it('is ready when the matching listener pod is Running with all containers ready', async () => {
    const client = makeClient({
      listenerItems: [listenerSpec('listener-ci', 'kubevirt-plugin-ci')],
      pod: {
        status: { containerStatuses: [{ ready: true, restartCount: 0 }], phase: 'Running' },
      },
    });

    const result = await checkArcListenerReady(client as never, {
      controllerNamespace: 'arc-systems',
      scaleSetName: 'kubevirt-plugin-ci',
      scaleSetNamespace: SCALE_SET_NS,
    });

    assert.equal(result.ready, true);
  });

  it('is not ready when the listener is CrashLoopBackOff', async () => {
    const client = makeClient({
      listenerItems: [listenerSpec('listener-ci', 'kubevirt-plugin-ci')],
      pod: {
        status: {
          containerStatuses: [
            {
              ready: false,
              restartCount: 3,
              state: { waiting: { reason: 'CrashLoopBackOff' } },
            },
          ],
          phase: 'Running',
        },
      },
    });

    const result = await checkArcListenerReady(client as never, {
      controllerNamespace: 'arc-systems',
      scaleSetName: 'kubevirt-plugin-ci',
      scaleSetNamespace: SCALE_SET_NS,
    });

    assert.equal(result.ready, false);
    assert.match(result.detail, /CrashLoopBackOff/);
  });

  it('is not ready when a container has restarted (ERS mismatch crash loop)', async () => {
    const client = makeClient({
      listenerItems: [listenerSpec('listener-ci', 'kubevirt-plugin-ci')],
      pod: {
        status: {
          containerStatuses: [{ ready: true, restartCount: 1 }],
          phase: 'Running',
        },
      },
    });

    const result = await checkArcListenerReady(client as never, {
      controllerNamespace: 'arc-systems',
      scaleSetName: 'kubevirt-plugin-ci',
      scaleSetNamespace: SCALE_SET_NS,
    });

    assert.equal(result.ready, false);
    assert.match(result.detail, /restartCount=1/);
  });

  it('is not ready when the listener pod is Running but a container is not ready', async () => {
    const client = makeClient({
      listenerItems: [listenerSpec('listener-ci', 'kubevirt-plugin-ci')],
      pod: { status: { containerStatuses: [{ ready: false }], phase: 'Running' } },
    });

    const result = await checkArcListenerReady(client as never, {
      controllerNamespace: 'arc-systems',
      scaleSetName: 'kubevirt-plugin-ci',
      scaleSetNamespace: SCALE_SET_NS,
    });

    assert.equal(result.ready, false);
  });

  it('is not ready when the listener pod is not in the Running phase', async () => {
    const client = makeClient({
      listenerItems: [listenerSpec('listener-ci', 'kubevirt-plugin-ci')],
      pod: { status: { containerStatuses: [{ ready: true }], phase: 'Pending' } },
    });

    const result = await checkArcListenerReady(client as never, {
      controllerNamespace: 'arc-systems',
      scaleSetName: 'kubevirt-plugin-ci',
      scaleSetNamespace: SCALE_SET_NS,
    });

    assert.equal(result.ready, false);
  });

  it('returns not-ready (never throws) when the pod lookup fails', async () => {
    const client = makeClient({
      listenerItems: [listenerSpec('listener-ci', 'kubevirt-plugin-ci')],
      podError: new Error('pods "listener-ci" not found'),
    });

    const result = await checkArcListenerReady(client as never, {
      controllerNamespace: 'arc-systems',
      scaleSetName: 'kubevirt-plugin-ci',
      scaleSetNamespace: SCALE_SET_NS,
    });

    assert.equal(result.ready, false);
    assert.match(result.detail, /Lookup failed/);
  });

  it('returns not-ready (never throws) when the listener-list call fails', async () => {
    const client = {
      coreV1: { readNamespacedPod: async () => ({}) },
      customObjects: {
        listNamespacedCustomObject: async () => {
          throw new Error('connection refused');
        },
      },
    };

    const result = await checkArcListenerReady(client as never, {
      controllerNamespace: 'arc-systems',
      scaleSetName: 'kubevirt-plugin-ci',
      scaleSetNamespace: SCALE_SET_NS,
    });

    assert.equal(result.ready, false);
    assert.match(result.detail, /Lookup failed/);
  });
});

describe('findArcListenerPodName', () => {
  it('returns null when no AutoscalingListener exists', async () => {
    const client = makeClient({ listenerItems: [] });

    const name = await findArcListenerPodName(client as never, {
      controllerNamespace: 'arc-systems',
      scaleSetName: 'kubevirt-plugin-ci',
      scaleSetNamespace: SCALE_SET_NS,
    });

    assert.equal(name, null);
  });

  it('returns null when only a different scale set/namespace has a listener', async () => {
    const client = makeClient({
      listenerItems: [listenerSpec('listener-421', 'kubevirt-plugin-421')],
    });

    const name = await findArcListenerPodName(client as never, {
      controllerNamespace: 'arc-systems',
      scaleSetName: 'kubevirt-plugin-ci',
      scaleSetNamespace: SCALE_SET_NS,
    });

    assert.equal(name, null);
  });

  it('returns the listener pod name for a matching scale set + namespace', async () => {
    const client = makeClient({
      listenerItems: [listenerSpec('listener-ci', 'kubevirt-plugin-ci')],
    });

    const name = await findArcListenerPodName(client as never, {
      controllerNamespace: 'arc-systems',
      scaleSetName: 'kubevirt-plugin-ci',
      scaleSetNamespace: SCALE_SET_NS,
    });

    assert.equal(name, 'listener-ci');
  });

  it('propagates a listener-list failure (caller decides how to handle it)', async () => {
    const client = {
      customObjects: {
        listNamespacedCustomObject: async () => {
          throw new Error('connection refused');
        },
      },
    };

    await assert.rejects(
      () =>
        findArcListenerPodName(client as never, {
          controllerNamespace: 'arc-systems',
          scaleSetName: 'kubevirt-plugin-ci',
          scaleSetNamespace: SCALE_SET_NS,
        }),
      /connection refused/,
    );
  });
});

describe('hasUnhealthyListenerContainer', () => {
  it('is true for CrashLoopBackOff', () => {
    assert.equal(
      hasUnhealthyListenerContainer({ state: { waiting: { reason: 'CrashLoopBackOff' } } }),
      true,
    );
  });

  it('is true for terminated Error', () => {
    assert.equal(
      hasUnhealthyListenerContainer({ state: { terminated: { reason: 'Error' } } }),
      true,
    );
  });

  it('is true when restartCount is at least 1', () => {
    assert.equal(hasUnhealthyListenerContainer({ ready: true, restartCount: 1 }), true);
  });

  it('is false for a healthy ready container with no restarts', () => {
    assert.equal(hasUnhealthyListenerContainer({ ready: true, restartCount: 0 }), false);
  });
});

describe('isPodReady', () => {
  it('is true when Running with every container ready and no restarts', () => {
    assert.equal(
      isPodReady({
        status: {
          containerStatuses: [
            { ready: true, restartCount: 0 },
            { ready: true, restartCount: 0 },
          ],
          phase: 'Running',
        },
      }),
      true,
    );
  });

  it('is false when a container is not ready', () => {
    assert.equal(
      isPodReady({ status: { containerStatuses: [{ ready: true }, { ready: false }], phase: 'Running' } }),
      false,
    );
  });

  it('is false when CrashLoopBackOff even if phase is Running', () => {
    assert.equal(
      isPodReady({
        status: {
          containerStatuses: [
            { ready: false, restartCount: 2, state: { waiting: { reason: 'CrashLoopBackOff' } } },
          ],
          phase: 'Running',
        },
      }),
      false,
    );
  });

  it('is false when a container has restarted', () => {
    assert.equal(
      isPodReady({
        status: { containerStatuses: [{ ready: true, restartCount: 1 }], phase: 'Running' },
      }),
      false,
    );
  });

  it('is false when not in the Running phase', () => {
    assert.equal(isPodReady({ status: { containerStatuses: [{ ready: true }], phase: 'Terminating' } }), false);
  });

  it('is false when there are no containerStatuses at all', () => {
    assert.equal(isPodReady({ status: { containerStatuses: [], phase: 'Running' } }), false);
  });

  it('is false when status is missing entirely', () => {
    assert.equal(isPodReady({}), false);
  });
});
