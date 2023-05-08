import { K8sGroupVersionKind } from '@openshift-console/dynamic-plugin-sdk/src/extensions/console-types';

export type ExportAppUserSettings = {
  [key: string]: {
    groupVersionKind: K8sGroupVersionKind;
    uid: string;
    name: string;
    namespace: string;
  };
};
