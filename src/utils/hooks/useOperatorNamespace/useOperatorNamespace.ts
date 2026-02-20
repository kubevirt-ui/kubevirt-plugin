import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { KUBEVIRT_HYPERCONVERGED, OPENSHIFT_CNV } from '@kubevirt-utils/constants/constants';
import { DEFAULT_OPERATOR_NAMESPACE } from '@kubevirt-utils/utils/utils';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';
import { signal } from '@preact/signals-react';

import { FEATURES_CONFIG_MAP_NAME } from '../useFeatures/constants';

const CANDIDATE_NAMESPACES = [OPENSHIFT_CNV, KUBEVIRT_HYPERCONVERGED] as const;

export const operatorNamespaceSignal = signal<null | string>(null);

const resolveOperatorNamespace = async (): Promise<string> => {
  for (const ns of CANDIDATE_NAMESPACES) {
    try {
      await k8sGet({ model: ConfigMapModel, name: FEATURES_CONFIG_MAP_NAME, ns });
      return ns;
    } catch (error) {
      if (error?.code === 404) continue;
      // Non-404 errors (e.g. 403 forbidden) mean the namespace exists
      return ns;
    }
  }
  return DEFAULT_OPERATOR_NAMESPACE;
};

resolveOperatorNamespace().then((ns) => {
  operatorNamespaceSignal.value = ns;
});
