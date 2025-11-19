import { useMemo } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { Operator } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/common-types';

import { TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_LABEL, TEMPLATE_TYPE_VM } from '../utils/constants';

import { TemplateModelGroupVersionKind } from './constants';
import useWatchNonAdminTemplates from './useWatchNonAdminTemplates';

/** A Hook that returns VM Templates from allowed namespaces
 * @param namespace - The namespace to filter the templates by
 * @param cluster
 */
export const useVmTemplates = (namespace?: string, cluster?: string): useVmTemplatesValues => {
  const isAdmin = useIsAdmin();

  const { allowedTemplates, allowedTemplatesError, allowedTemplatesloaded } =
    useWatchNonAdminTemplates();

  const [allTemplates, allTemplatesLoaded, allTemplatesError] = useK8sWatchData<V1Template[]>({
    cluster,
    groupVersionKind: TemplateModelGroupVersionKind,
    isList: true,
    selector: {
      matchExpressions: [
        {
          key: TEMPLATE_TYPE_LABEL,
          operator: Operator.In,
          values: [TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_VM],
        },
      ],
    },
  });

  const templates = useMemo(
    () => (isAdmin ? allTemplates : allowedTemplates),
    [allTemplates, allowedTemplates, isAdmin],
  );

  const memoizedTemplates = useMemo(
    () => (namespace ? templates.filter((t) => t.metadata.namespace === namespace) : templates),
    [namespace, templates],
  );

  return {
    loaded: isAdmin ? allTemplatesLoaded : allowedTemplatesloaded,
    loadError: isAdmin ? allTemplatesError : allowedTemplatesError,
    templates: memoizedTemplates,
  };
};

type useVmTemplatesValues = {
  loaded: boolean;
  loadError: any;
  templates: V1Template[];
};
