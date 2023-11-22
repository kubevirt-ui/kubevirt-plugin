import * as React from 'react';

import {
  modelToGroupVersionKind,
  ProjectModel,
  TemplateModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import {
  K8sResourceCommon,
  useK8sWatchResource,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';
import { Operator } from '@openshift-console/dynamic-plugin-sdk-internal/lib/api/common-types';

import { TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_LABEL, TEMPLATE_TYPE_VM } from '../utils/constants';

const OPENSHIFT_NS = 'openshift';

/** A Hook that returns VM Templates from allowed namespaces
 * @param namespace - The namespace to filter the templates by
 */
export const useVmTemplates = (namespace?: string): useVmTemplatesValues => {
  const [allowedTemplates, setAllowedTemplates] = React.useState<V1Template[]>([]);
  const [allowedTemplatesloaded, setAllowedTemplatesLoaded] = React.useState<boolean>(false);
  const [allowedTemplatesError, setAllowedTemplatesError] = React.useState<string>('');

  const isAdmin = useIsAdmin();
  const TemplateModelGroupVersionKind = modelToGroupVersionKind(TemplateModel);

  const [projects, loaded] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });

  // Bug fix: BZ: https://bugzilla.redhat.com/show_bug.cgi?id=2081295
  const projectNames = projects?.map((proj) => proj?.metadata?.name);
  if (projectNames && !projectNames.includes(OPENSHIFT_NS)) {
    projectNames.push(OPENSHIFT_NS);
  }

  const [allTemplates, allTemplatesLoaded, allTemplatesError] = useK8sWatchResource<V1Template[]>({
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

  // user has limited access, so we can only get templates from allowed namespaces
  const allowedResources = useK8sWatchResources<{ [key: string]: V1Template[] }>(
    Object.fromEntries(
      loaded && !isAdmin
        ? (projectNames || []).map((name) => [
            name,
            {
              groupVersionKind: TemplateModelGroupVersionKind,
              isList: true,
              namespace: name,
              selector: {
                matchExpressions: [
                  {
                    key: TEMPLATE_TYPE_LABEL,
                    operator: Operator.In,
                    values: [TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_VM],
                  },
                ],
              },
            },
          ])
        : [],
    ),
  );

  const templates = React.useMemo(
    () => (isAdmin ? allTemplates : allowedTemplates),
    [allTemplates, allowedTemplates, isAdmin],
  );

  React.useEffect(() => {
    if (!isAdmin) {
      const errorKey = Object.keys(allowedResources).find((key) => allowedResources[key].loadError);
      if (errorKey) {
        setAllowedTemplatesError(allowedResources[errorKey].loadError);
      }
      if (
        Object.keys(allowedResources).length > 0 &&
        Object.keys(allowedResources).every((key) => {
          return allowedResources[key].loaded || allowedResources[key].loadError;
        })
      ) {
        setAllowedTemplates(Object.values(allowedResources).flatMap((r) => r.data));
        setAllowedTemplatesLoaded(true);
      }
    }
  }, [allowedResources, isAdmin]);

  const memoizedTemplates = React.useMemo(
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
