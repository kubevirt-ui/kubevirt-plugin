import { IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getStatusPhase } from '@kubevirt-utils/resources/shared';

import { VMIPhase } from '../constants';

export const getNodeName = (pod: IoK8sApiCoreV1Pod): string => pod?.spec?.nodeName;

export const isVMIReady = (vmi: V1VirtualMachineInstance) =>
  getStatusPhase(vmi) === VMIPhase.Running;
