import { isKubevirtResource } from './is-kubevirt-resource';
import { getKubevirtComponentFactory } from './kubevirt-component-factory';
import { getKubevirtTopologyDataModel } from './kubevirt-data-transformer';

export const kubevirtComponentFactory = getKubevirtComponentFactory;
export const getKubevirtDataModel = getKubevirtTopologyDataModel;
export const isResourceDepicted = isKubevirtResource;
