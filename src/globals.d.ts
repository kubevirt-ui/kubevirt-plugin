import kubevirtUITypes from '@kubevirt-ui/kubevirt-api';
import type { V1Template as OriginalV1Template } from '@kubevirt-ui/kubevirt-api/console';
import type { K8sResourceCommon as OriginalK8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

declare module '@kubevirt-ui/kubevirt-api/containerized-data-importer/models' {
  interface V1beta1DataVolume extends kubevirtUITypes.V1beta1DataVolume {
    cluster?: string;
  }
}

declare module '@kubevirt-ui/kubevirt-api/kubevirt' {
  interface V1VirtualMachineInstance extends kubevirtUITypes.V1VirtualMachineInstance {
    cluster?: string;
  }

  interface V1beta1DataSource extends kubevirtUITypes.V1beta1DataSource {
    cluster?: string;
  }

  declare module '*.scss' {
    const content: { [className: string]: string };
    export default content;
  }

  interface V1beta1VirtualMachineClusterInstancetype
    extends kubevirtUITypes.V1beta1VirtualMachineClusterInstancetype {
    cluster?: string;
  }

  interface V1beta1VirtualMachineInstancetype
    extends kubevirtUITypes.V1beta1VirtualMachineInstancetype {
    cluster?: string;
  }

  interface V1beta1VirtualMachineSnapshot extends kubevirtUITypes.V1beta1VirtualMachineSnapshot {
    cluster?: string;
  }

  interface V1VirtualMachine extends kubevirtUITypes.V1VirtualMachine {
    cluster?: string;
  }
  interface V1VirtualMachineInstanceMigration
    extends kubevirtUITypes.V1VirtualMachineInstanceMigration {
    cluster?: string;
  }

  interface V1beta1VirtualMachineClone extends kubevirtUITypes.V1beta1VirtualMachineClone {
    cluster?: string;
  }

  interface V1alpha1MigrationPolicy extends kubevirtUITypes.V1alpha1MigrationPolicy {
    cluster?: string;
  }
}

declare module '@kubevirt-ui/kubevirt-api/kubernetes' {
  interface IoK8sApiCoreV1Pod extends kubevirtUITypes.IoK8sApiCoreV1Pod {
    cluster?: string;
  }
}

declare module '@kubev2v/types' {
  interface V1beta1Plan extends mtvTypes.V1beta1Plan {
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
