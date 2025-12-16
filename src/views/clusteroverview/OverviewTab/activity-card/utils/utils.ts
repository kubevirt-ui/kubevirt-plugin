import { VirtualMachineInstanceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { FirehoseResource, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

export const eventTypes = [
  VirtualMachineModel.kind,
  VirtualMachineInstanceModel.kind,
  'HyperConverged',
];

export const asUniqueResource = (
  resource: FirehoseResource,
  prefix: number | string,
): FirehoseResource => ({
  ...resource,
  prop: `${prefix}-${resource.prop}`,
});

export const asWatchK8sResource = (resource: FirehoseResource): WatchK8sResource => {
  return {
    ...resource,
    isList: resource?.isList || true,
  };
};
