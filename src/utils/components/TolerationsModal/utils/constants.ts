import { K8sIoApiCoreV1Toleration } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { IDEntity } from '@kubevirt-utils/components/NodeSelectorModal/utils/types';

export type TolerationLabel = IDEntity & K8sIoApiCoreV1Toleration;

export const TOLERATIONS_EFFECTS = ['NoSchedule', 'PreferNoSchedule', 'NoExecute'];
