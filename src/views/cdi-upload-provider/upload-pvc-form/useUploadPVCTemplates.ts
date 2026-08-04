import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  TemplateModel,
  type V1Template,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_VM_COMMON_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import {
  type K8sVerb,
  useK8sWatchResource,
  type WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

import useBaseImages from '../hooks/useBaseImages';
import useMultipleAccessReviews from '../hooks/useMultipleAccessReviews';
import { CDI_UPLOAD_OS_URL_PARAM } from '../utils/consts';
import { getPVCNamespace } from '../utils/selectors';

const templatesResource: WatchK8sResource = {
  groupVersionKind: modelToGroupVersionKind(TemplateModel),
  isList: true,
  namespace: TEMPLATE_VM_COMMON_NAMESPACE,
  optional: true,
  selector: { matchLabels: { [TEMPLATE_TYPE_LABEL]: TEMPLATE_TYPE_BASE } },
};

type UseUploadPVCTemplatesResult = {
  allowedTemplates: V1Template[];
  errorPvcs: Error | undefined;
  errorTemplates: Error | undefined;
  goldenPvcs: V1beta1PersistentVolumeClaim[];
  loadedPvcs: boolean;
  loadedTemplates: boolean;
  osParam: null | string;
  rbacLoading: boolean;
};

export const useUploadPVCTemplates = (): UseUploadPVCTemplatesResult => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [commonTemplates, loadedTemplates, errorTemplates] =
    useK8sWatchResource<V1Template[]>(templatesResource);

  const goldenNamespacesResources = useMemo(() => {
    const goldenNamespaces = [
      ...new Set((commonTemplates ?? []).map((tmpl) => getPVCNamespace(tmpl)).filter((ns) => !!ns)),
    ];
    return goldenNamespaces.map((ns) => ({
      group: DataVolumeModel.apiGroup,
      namespace: ns,
      resource: DataVolumeModel.plural,
      verb: 'create' as K8sVerb,
    }));
  }, [commonTemplates]);

  const [goldenAccessReviews, rbacLoading] = useMultipleAccessReviews(
    goldenNamespacesResources,
    null,
  );

  const allowedTemplates = useMemo(
    () =>
      (commonTemplates ?? []).filter((tmp) =>
        goldenAccessReviews.some(
          (review) =>
            review.allowed && review.resourceAttributes?.namespace === getPVCNamespace(tmp),
        ),
      ),
    [commonTemplates, goldenAccessReviews],
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [goldenPvcs, loadedPvcs, errorPvcs] = useBaseImages(allowedTemplates);

  const osParam = new URLSearchParams(window.location.search).get(CDI_UPLOAD_OS_URL_PARAM);

  return {
    allowedTemplates,
    errorPvcs: errorPvcs as Error | undefined,
    errorTemplates: errorTemplates as Error | undefined,
    goldenPvcs,
    loadedPvcs,
    loadedTemplates,
    osParam,
    rbacLoading,
  };
};
