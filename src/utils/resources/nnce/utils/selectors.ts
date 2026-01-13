import { V1beta1NodeNetworkConfigurationEnactment } from '@kubevirt-ui-ext/kubevirt-api/nmstate';
import {
  ENACTMENT_STATE_NNCP_LABEL,
  ENACTMENT_STATE_NODE_LABEL,
} from '@kubevirt-utils/resources/nnce/utils/constants';
import { getLabel } from '@kubevirt-utils/resources/shared';

export const getEnactmentStatus = (
  nnce: V1beta1NodeNetworkConfigurationEnactment,
): string | undefined =>
  nnce?.status?.conditions?.find((condition) => condition.status === 'True')?.type;

export const getEnactmentStateNode = (
  nnce: V1beta1NodeNetworkConfigurationEnactment,
): string | undefined => getLabel(nnce, ENACTMENT_STATE_NODE_LABEL, undefined);

export const getEnactmentStateNNCP = (
  nnce: V1beta1NodeNetworkConfigurationEnactment,
): string | undefined => getLabel(nnce, ENACTMENT_STATE_NNCP_LABEL, undefined);
