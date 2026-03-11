import { ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  KUBEVIRT_HYPERCONVERGED,
  KUBEVIRT_OS_IMAGES_NS,
  OPENSHIFT_CNV,
  OPENSHIFT_OS_IMAGES_NS,
} from '@kubevirt-utils/constants/constants';
import { getName } from '@kubevirt-utils/resources/shared';
import { DEFAULT_OPERATOR_NAMESPACE } from '@kubevirt-utils/utils/utils';
import { k8sList, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { signal } from '@preact/signals-react';

export const operatorNamespaceSignal = signal<null | string>(null);

const resolveOperatorNamespace = async (): Promise<string> => {
  try {
    const projectsResponse = await k8sList<K8sResourceCommon>({
      model: ProjectModel,
      queryParams: {},
    });

    const projects = Array.isArray(projectsResponse)
      ? projectsResponse
      : projectsResponse?.items || [];

    if (projects.some((p) => getName(p) === OPENSHIFT_OS_IMAGES_NS)) return OPENSHIFT_CNV;
    if (projects.some((p) => getName(p) === KUBEVIRT_OS_IMAGES_NS)) return KUBEVIRT_HYPERCONVERGED;
  } catch {
    // Fall through to default
  }

  return DEFAULT_OPERATOR_NAMESPACE;
};

resolveOperatorNamespace().then((ns) => {
  operatorNamespaceSignal.value = ns;
});
