import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const MTV_OPERATOR = 'mtv-operator';

export const MTV_ROUTE_NAME = 'virt';

export type PackageManifestKind = K8sResourceCommon & { status: any };

export type SubscriptionsKind = K8sResourceCommon & { spec: any; status: any };

export const MIGRATION_TOOL_DOCUMENTATION_URL =
  'https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization/2.3/html/installing_and_using_the_migration_toolkit_for_virtualization';
