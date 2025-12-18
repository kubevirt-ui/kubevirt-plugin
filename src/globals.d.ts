import type { V1Template as OriginalV1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataVolume as OriginalV1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1Pod as OriginalIoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import * as kubevirtUITypes from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import type { K8sResourceCommon as OriginalK8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

declare module '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer' {
  interface V1beta1DataVolume extends OriginalV1beta1DataVolume {
    cluster?: string;
  }
}

declare module '@kubevirt-ui-ext/kubevirt-api/kubevirt' {
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

declare module '@kubevirt-ui-ext/kubevirt-api/kubernetes' {
  interface IoK8sApiCoreV1Pod extends OriginalIoK8sApiCoreV1Pod {
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
