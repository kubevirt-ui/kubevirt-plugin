import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { NODE_HEIGHT, NODE_PADDING, NODE_WIDTH } from './constants';

export const WorkloadModelProps = {
  group: false,
  height: NODE_HEIGHT,
  style: {
    padding: NODE_PADDING,
  },
  visible: true,
  width: NODE_WIDTH,
};

export const getBasicID = <A extends K8sResourceCommon = K8sResourceCommon>(entity: A) =>
  `${getNamespace(entity)}-${getName(entity)}`;

export const prefixedID = (idPrefix: string, id: string) =>
  idPrefix && id ? `${idPrefix}-${id}` : null;
