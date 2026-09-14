import type React from 'react';
import { type NavigateFunction } from 'react-router';
import { type TFunction } from 'i18next';

import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getVirtualMachineDetailsTabLabel,
  type VirtualMachineDetailsTab,
} from '@kubevirt-utils/constants/tabs-constants';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtK8sUpdate } from '@multicluster/k8sRequests';

import { getTabURL } from '../../utils/helpers';
import { type PendingChange } from '../../utils/types';

export type BuildPendingChangesParams = {
  affinityChanged: boolean;
  authorizedSSHKeys: Record<string, string>;
  bootModeChanged: boolean;
  bootOrderChanged: boolean;
  cloudInitChanged: boolean;
  cluster: string;
  cpuMemoryChanged: boolean;
  createModal: (
    render: (props: { isOpen: boolean; onClose: () => void }) => React.ReactNode,
  ) => void;
  dedicatedResourcesChanged: boolean;
  evictionStrategyChanged: boolean;
  hideYamlTab: boolean;
  hostnameChanged: boolean;
  instanceTypeChanged: boolean;
  instanceTypeExpandedSpec: V1VirtualMachine;
  modifiedCDROMs: string[];
  modifiedEnvDisks: string[];
  modifiedGPUDevices: string[];
  modifiedGuestSystemAccessLog: boolean;
  modifiedHeadlessMode: boolean;
  modifiedHostDevices: string[];
  modifiedNICs: string[];
  modifiedVolumesHotplug: V1VirtualMachine['spec']['template']['spec']['volumes'];
  navigate: NavigateFunction;
  nodes: IoK8sApiCoreV1Node[];
  nodeSelectorChanged: boolean;
  nodesLoaded: boolean;
  sshServiceChanged: boolean;
  startStrategyChanged: boolean;
  t: TFunction;
  tolerationsChanged: boolean;
  updateAuthorizedSSHKeys: (keys: Record<string, string>) => void;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

export type PendingChangeContext = {
  createModal: BuildPendingChangesParams['createModal'];
  createProps: (
    tab: VirtualMachineDetailsTab,
    additionalAction?: () => void,
  ) => Pick<PendingChange, 'handleAction' | 'tab' | 'tabLabel'>;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  params: BuildPendingChangesParams;
};

export const createPendingChangeContext = (
  params: BuildPendingChangesParams,
): PendingChangeContext => {
  const { cluster, navigate, t, vm } = params;

  const onSubmit = (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> =>
    kubevirtK8sUpdate({
      cluster,
      data: updatedVM,
      model: VirtualMachineModel,
      name: updatedVM?.metadata?.name,
      ns: getNamespace(updatedVM),
    });

  const createProps = (
    tab: VirtualMachineDetailsTab,
    additionalAction?: () => void,
  ): Pick<PendingChange, 'handleAction' | 'tab' | 'tabLabel'> => {
    const tabLabels = getVirtualMachineDetailsTabLabel(t);
    return {
      handleAction: (): void => {
        navigate(getTabURL(vm, tab));
        additionalAction?.();
      },
      tab,
      tabLabel: tabLabels[tab],
    };
  };

  return { createModal: params.createModal, createProps, onSubmit, params };
};
