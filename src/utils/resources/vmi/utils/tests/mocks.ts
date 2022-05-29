import produce from 'immer';

import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const serviceWithUndefinedSelectors: IoK8sApiCoreV1Service = {
  kind: 'Service',
  apiVersion: 'v1',
  metadata: {
    name: 'openshift',
    namespace: 'default',
    uid: '7e5f09e1-ef35-455b-ac57-e7fa5c96b45d',
    resourceVersion: '10124',
    creationTimestamp: '2022-05-25T02:58:54Z',
    managedFields: [
      {
        manager: 'dns-operator',
        operation: 'Update',
        apiVersion: 'v1',
        time: '2022-05-25T02:58:54Z',
        fieldsType: 'FieldsV1',
      },
    ],
  },
  spec: {
    externalName: 'kubernetes.default.svc.cluster.local',
    internalTrafficPolicy: 'Cluster',
  },
  status: {
    loadBalancer: {},
  },
};

export const serviceWithoutSelectors: IoK8sApiCoreV1Service = produce(
  serviceWithUndefinedSelectors,
  (serviceDraft) => {
    serviceDraft.spec.selector = {};
  },
);
export const serviceWithoutMatchingSelectors: IoK8sApiCoreV1Service = produce(
  serviceWithUndefinedSelectors,
  (serviceDraft) => {
    serviceDraft.spec.selector = {
      unmatchedlabel: 'fedora-proposed-rodent',
    };
  },
);
export const serviceWithMatchingSelectors: IoK8sApiCoreV1Service = produce(
  serviceWithUndefinedSelectors,
  (serviceDraft) => {
    serviceDraft.spec.selector = {
      'vm.kubevirt.io/name': 'fedora-proposed-rodent',
    };
  },
);

export const vmiMock: V1VirtualMachineInstance = {
  kind: 'VirtualMachineInstance',
  apiVersion: 'v1',
  metadata: {
    name: 'fedora-proposed-rodent',
    namespace: 'default',
    uid: '7e5f09e1-ef35-455b-ac57-e7fa5c96b45d',
    resourceVersion: '10124',
    creationTimestamp: '2022-05-25T02:58:54Z',
    labels: {
      'vm.kubevirt.io/name': 'fedora-proposed-rodent',
    },
  },
  spec: {
    domain: {
      devices: {
        disks: [],
      },
      cpu: {
        cores: 1,
        sockets: 1,
        threads: 1,
      },
    },
  },
};
