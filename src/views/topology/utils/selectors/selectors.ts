import { type IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getStatusPhase } from '@kubevirt-utils/resources/shared';

import { VMIPhase } from '../constants';

export const getNodeName = (pod: IoK8sApiCoreV1Pod): string => pod?.spec?.nodeName;

export const isVMIReady = (vmi: V1VirtualMachineInstance): boolean =>
  getStatusPhase(vmi) === VMIPhase.Running;
