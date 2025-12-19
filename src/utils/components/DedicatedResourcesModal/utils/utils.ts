import {
  cpuManagerLabelKey,
  cpuManagerLabelValue,
} from '@kubevirt-utils/components/DedicatedResourcesModal/utils/constants';
import { getSearchLabelHREF } from '@kubevirt-utils/components/Labels/utils';
import { NodeModel } from '@kubevirt-utils/models';

export const getDedicatedResourcesSearchHREF = (cluster?: string) =>
  getSearchLabelHREF(NodeModel.kind, cpuManagerLabelKey, cpuManagerLabelValue, cluster);
