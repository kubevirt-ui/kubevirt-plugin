import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { checkArcListenerReady } from './arc-listener';

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
      pod: { status: { containerStatuses: [{ ready: true }], phase: 'Running' } },
    });

    const result = await checkArcListenerReady(client as never, {
      controllerNamespace: 'arc-systems',
      scaleSetName: 'kubevirt-plugin-ci',
      scaleSetNamespace: SCALE_SET_NS,
    });

    assert.equal(result.ready, true);
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
