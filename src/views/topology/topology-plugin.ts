import { isKubevirtResource } from './utils/is-kubevirt-resource';
import { getKubevirtComponentFactory } from './utils/kubevirt-component-factory';
import { getKubevirtTopologyDataModel } from './utils/kubevirt-data-transformer';

export const kubevirtComponentFactory = getKubevirtComponentFactory;
export const getKubevirtDataModel = getKubevirtTopologyDataModel;
export const isResourceDepicted = isKubevirtResource;
