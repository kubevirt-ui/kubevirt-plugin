import { PackageManifestKind } from './constant';

export const createInstallUrl = (operator: PackageManifestKind, namespace?: string) =>
  `/operatorhub/subscribe?pkg=${operator?.metadata?.name}&catalog=${operator?.status?.catalogSource}&catalogNamespace=${operator?.status?.catalogSourceNamespace}&targetNamespace=${namespace}`;
