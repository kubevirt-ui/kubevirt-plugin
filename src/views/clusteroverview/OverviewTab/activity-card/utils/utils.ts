import { VirtualMachineInstanceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type WatchK8sResource,
  type WatchK8sResourceWithProp,
} from '@openshift-console/dynamic-plugin-sdk';

export const eventTypes = [
  VirtualMachineModel.kind,
  VirtualMachineInstanceModel.kind,
  'HyperConverged',
];

export const asUniqueResource = (
  resource: WatchK8sResourceWithProp,
  prefix: number | string,
): WatchK8sResourceWithProp => ({
  ...resource,
  prop: `${prefix}-${resource.prop}`,
});

export const asWatchK8sResource = (resource: WatchK8sResourceWithProp): WatchK8sResource => {
  const { prop: _prop, ...watchResource } = resource;

  return {
    ...watchResource,
    isList: resource.isList ?? true,
  };
};
