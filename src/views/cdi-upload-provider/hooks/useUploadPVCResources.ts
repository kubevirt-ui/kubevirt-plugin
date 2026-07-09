import { useContext, useMemo } from 'react';

import {
  modelToGroupVersionKind,
  TemplateModel,
  type V1Template,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1beta1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useReadyStorageClasses from '@kubevirt-utils/hooks/useReadyStorageClasses/useReadyStorageClasses';
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

import { CDIUploadContext, type CDIUploadContextProps } from '../utils/context';
import { getPVCNamespace } from '../utils/selectors';
import useBaseImages from './useBaseImages';
import useMultipleAccessReviews from './useMultipleAccessReviews';

const templatesResource: WatchK8sResource = {
  groupVersionKind: modelToGroupVersionKind(TemplateModel),
  isList: true,
  namespace: TEMPLATE_VM_COMMON_NAMESPACE,
  optional: true,
  selector: {
    matchLabels: { [TEMPLATE_TYPE_LABEL]: TEMPLATE_TYPE_BASE },
  },
};

type UseUploadPVCResources = {
  allowedTemplates: V1Template[];
  errorPvcs: Error;
  errorTemplates: Error;
  goldenPvcs: V1beta1PersistentVolumeClaim[];
  loadedPvcs: boolean;
  loadedTemplates: boolean;
  namespaceParam: string;
  rbacLoading: boolean;
  readyStorageClasses: IoK8sApiStorageV1StorageClass[];
  scLoaded: boolean;
  uploadContext: CDIUploadContextProps;
};

const useUploadPVCResources = (): UseUploadPVCResources => {
  const watchResult = useK8sWatchResource<V1Template[]>(templatesResource);
  const commonTemplates = watchResult[0];
  const loadedTemplates = watchResult[1];
  const errorTemplates = watchResult[2] as Error | undefined;

  const goldenNamespacesResources = useMemo(() => {
    const goldenNamespaces = [
      ...new Set(
        (commonTemplates ?? [])
          .map((template) => getPVCNamespace(template))
          .filter((namespace) => !!namespace),
      ),
    ];

    return goldenNamespaces.map((namespace) => ({
      group: DataVolumeModel.apiGroup,
      namespace,
      resource: DataVolumeModel.plural,
      verb: 'create' as K8sVerb,
    }));
  }, [commonTemplates]);

  const [goldenAccessReviews, rbacLoading] = useMultipleAccessReviews(
    goldenNamespacesResources,
    null,
  );

  const allowedTemplates = commonTemplates.filter((tmp) =>
    goldenAccessReviews.some(
      (accessReview) =>
        accessReview.allowed && accessReview.resourceAttributes.namespace === getPVCNamespace(tmp),
    ),
  );

  const baseImagesResult = useBaseImages(allowedTemplates);
  const goldenPvcs = baseImagesResult[0];
  const loadedPvcs = baseImagesResult[1];
  const errorPvcs = baseImagesResult[2] as Error | undefined;
  const uploadContext = useContext(CDIUploadContext);
  const [{ readyStorageClasses }, scLoaded] = useReadyStorageClasses();
  const namespaceParam = useNamespaceParam();

  return {
    allowedTemplates,
    errorPvcs: errorPvcs as Error,
    errorTemplates: errorTemplates as Error,
    goldenPvcs,
    loadedPvcs,
    loadedTemplates,
    namespaceParam,
    rbacLoading,
    readyStorageClasses,
    scLoaded,
    uploadContext,
  };
};

export default useUploadPVCResources;
