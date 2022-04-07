import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { FirehoseResource, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

export const eventTypes = [
  VirtualMachineModel.kind,
  VirtualMachineInstanceModel.kind,
  'HyperConverged',
];

export const asUniqueResource = (
  resource: FirehoseResource,
  prefix: string | number,
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
