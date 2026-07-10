import type {
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import type { NodeKind } from '@openshift-console/dynamic-plugin-sdk';
import type { VMIMapper } from '@virtualmachines/utils/mappers';

export const mockUseAccessibleResources = jest.fn();
export const mockUseVirtualMachineInstanceMapper = jest.fn();

export const createNode = (name: string): NodeKind =>
  ({
    apiVersion: 'v1',
    kind: 'Node',
    metadata: { name },
  }) as NodeKind;

export const createVM = (name: string, namespace: string, status: string): V1VirtualMachine =>
  ({
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: { name, namespace },
    status: { printableStatus: status },
  }) as V1VirtualMachine;

export const createVMIMapper = (
  vmiEntries: { name: string; namespace: string; nodeName: string }[],
): VMIMapper =>
  vmiEntries.reduce(
    (acc, { name, namespace, nodeName }) => {
      acc.mapper[SINGLE_CLUSTER_KEY] = acc.mapper[SINGLE_CLUSTER_KEY] ?? {};
      acc.mapper[SINGLE_CLUSTER_KEY][namespace] = acc.mapper[SINGLE_CLUSTER_KEY][namespace] ?? {};
      acc.mapper[SINGLE_CLUSTER_KEY][namespace][name] = {
        metadata: { name, namespace },
        status: { nodeName },
      } as V1VirtualMachineInstance;
      if (nodeName && !acc.nodeNames[nodeName]) {
        acc.nodeNames[nodeName] = { id: nodeName, title: nodeName };
      }
      return acc;
    },
    { mapper: {}, nodeNames: {} } as VMIMapper,
  );

export const mockLoadedState = ({
  loadError,
  resources,
  vmiEntries,
  vmisLoaded = true,
}: {
  loadError?: Error;
  resources: V1VirtualMachine[];
  vmiEntries: { name: string; namespace: string; nodeName: string }[];
  vmisLoaded?: boolean;
}): void => {
  mockUseAccessibleResources.mockReturnValue({
    loaded: true,
    loadError,
    resources,
  });
  mockUseVirtualMachineInstanceMapper.mockReturnValue({
    vmiMapper: createVMIMapper(vmiEntries),
    vmisLoaded,
  });
};
