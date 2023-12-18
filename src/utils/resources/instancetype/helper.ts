import VirtualMachineClusterInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineClusterInstancetypeModel';
import VirtualMachineInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstancetypeModel';
import { V1InstancetypeMatcher } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const getInstanceTypeModelFromMatcher = (
  instanceTypeMatcher: V1InstancetypeMatcher,
): K8sModel =>
  instanceTypeMatcher.kind.includes('cluster')
    ? VirtualMachineClusterInstancetypeModel
    : VirtualMachineInstancetypeModel;
