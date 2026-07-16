import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_JSONPATCH_ANNOTATION } from '../../utils/featureGateAnnotation';

export const escapedAnnotationKey = KUBEVIRT_JSONPATCH_ANNOTATION.replace(/\//g, '~1');
export const annotationPath = `/metadata/annotations/${escapedAnnotationKey}`;

export const mockHCConfig = jest.fn();
export const mockHCConfiguration = jest.fn();
export const mockFeatureEnabled = jest.fn();
export const mockKubevirtK8sPatch = jest.fn().mockResolvedValue({});

export const resetVSOCKMocks = () => {
  jest.clearAllMocks();
  mockFeatureEnabled.mockReturnValue({ featureEnabled: true, isLoading: false });
  mockHCConfig.mockReturnValue({ featureGates: ['VSOCK'], hcLoaded: true });
};

export const createVM = (
  overrides: {
    autoattachVSOCK?: boolean;
    cluster?: string;
    name?: string;
    namespace?: string;
  } = {},
): V1VirtualMachine => {
  const { autoattachVSOCK, cluster, name = 'test-vm', namespace = 'default' } = overrides;
  const vm: V1VirtualMachine = {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: { name, namespace },
    spec: {
      template: {
        spec: {
          domain: {
            devices: {
              ...(autoattachVSOCK !== undefined && { autoattachVSOCK }),
            },
          },
        },
      },
    },
  };
  if (cluster) (vm as V1VirtualMachine & { cluster: string }).cluster = cluster;
  return vm;
};

export const createVMI = (
  overrides: {
    autoattachVSOCK?: boolean;
    name?: string;
    namespace?: string;
  } = {},
): V1VirtualMachineInstance => {
  const { autoattachVSOCK, name = 'test-vmi', namespace = 'default' } = overrides;
  return {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachineInstance',
    metadata: { name, namespace },
    spec: {
      domain: {
        devices: {
          ...(autoattachVSOCK !== undefined && { autoattachVSOCK }),
        },
      },
    },
    status: {},
  };
};

export const createHyperConverged = (annotations?: Record<string, string>): K8sResourceCommon => ({
  apiVersion: 'hco.kubevirt.io/v1beta1',
  kind: 'HyperConverged',
  metadata: {
    name: 'kubevirt-hyperconverged',
    namespace: 'openshift-cnv',
    ...(annotations && { annotations }),
  },
});
