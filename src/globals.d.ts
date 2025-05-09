import kubevirtUITypes from '@kubevirt-ui/kubevirt-api';
import type { V1Template as OriginalV1Template } from '@kubevirt-ui/kubevirt-api/console';
import type { K8sResourceCommon as OriginalK8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

declare module '@kubevirt-ui/kubevirt-api/kubevirt' {
  interface V1VirtualMachineInstance extends kubevirtUITypes.V1VirtualMachineInstance {
    cluster?: string;
  }

  interface V1VirtualMachine extends kubevirtUITypes.V1VirtualMachine {
    cluster?: string;
  }
}

declare module '@kubevirt-ui/kubevirt-api/kubernetes' {
  interface IoK8sApiCoreV1Pod extends kubevirtUITypes.IoK8sApiCoreV1Pod {
    cluster?: string;
  }
}

declare global {
  type K8sResourceCommon = OriginalK8sResourceCommon & {
    cluster?: string;
  };

  type V1Template = OriginalV1Template & {
    cluster?: string;
  };
}

export {};
