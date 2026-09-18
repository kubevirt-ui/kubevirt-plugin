import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VirtualMachineSubresourcesModel } from '@kubevirt-utils/models';

import {
  asBulkAccessReview,
  asNamespaceAccessReview,
  getBulkNamespaceScopes,
} from './accessReviewUtils';

const createVM = (name: string, namespace: string, cluster?: string): V1VirtualMachine =>
  ({
    cluster,
    metadata: {
      name,
      namespace,
    },
  }) as V1VirtualMachine;

describe('accessReviewUtils', () => {
  describe('getBulkNamespaceScopes', () => {
    it('returns unique cluster/namespace pairs', () => {
      const vms = [
        createVM('vm-a', 'ns-1', 'cluster-a'),
        createVM('vm-b', 'ns-1', 'cluster-a'),
        createVM('vm-c', 'ns-2', 'cluster-a'),
      ];

      expect(getBulkNamespaceScopes(vms)).toEqual([
        { cluster: 'cluster-a', namespace: 'ns-1' },
        { cluster: 'cluster-a', namespace: 'ns-2' },
      ]);
    });

    it('ignores VMs without a namespace', () => {
      expect(getBulkNamespaceScopes([createVM('vm-a', '')])).toEqual([]);
    });
  });

  describe('asNamespaceAccessReview', () => {
    it('omits resource name for namespace-level checks', () => {
      expect(
        asNamespaceAccessReview(
          VirtualMachineSubresourcesModel,
          { cluster: 'cluster-a', namespace: 'ns-1' },
          'update',
          'start',
        ),
      ).toEqual({
        cluster: 'cluster-a',
        group: 'subresources.kubevirt.io',
        namespace: 'ns-1',
        resource: 'virtualmachines',
        subresource: 'start',
        verb: 'update',
      });
    });
  });

  describe('asBulkAccessReview', () => {
    it('returns a namespace-level review when all VMs are in one namespace', () => {
      expect(
        asBulkAccessReview(
          VirtualMachineModel,
          [createVM('vm-a', 'ns-1', 'cluster-a'), createVM('vm-b', 'ns-1', 'cluster-a')],
          'patch',
        ),
      ).toEqual({
        cluster: 'cluster-a',
        group: 'kubevirt.io',
        namespace: 'ns-1',
        resource: 'virtualmachines',
        verb: 'patch',
      });
    });

    it('returns undefined when VMs span multiple namespaces', () => {
      expect(
        asBulkAccessReview(
          VirtualMachineModel,
          [createVM('vm-a', 'ns-1', 'cluster-a'), createVM('vm-b', 'ns-2', 'cluster-a')],
          'patch',
        ),
      ).toBeUndefined();
    });

    it('returns undefined when VMs have no namespace', () => {
      expect(
        asBulkAccessReview(VirtualMachineModel, [createVM('vm-a', '')], 'patch'),
      ).toBeUndefined();
    });
  });
});
