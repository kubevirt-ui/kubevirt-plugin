import * as React from 'react';

import {
  modelToGroupVersionKind,
  ProjectModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import {
  K8sResourceCommon,
  useK8sWatchResource,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';

import { TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_LABEL, TEMPLATE_TYPE_VM } from '../utils/constants';

/** A Hook that returns VM Templates from allowed namespaces
 * @param namespace - The namespace to filter the templates by
 */
export const useVmTemplates = (namespace?: string): useVmTemplatesValues => {
  const [templates, setTemplates] = React.useState<V1Template[]>([]);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string>('');
  const [isAdmin] = useIsAdmin();

  const [projects] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    namespaced: false,
    isList: true,
  });

  const templatesResources = React.useMemo(() => {
    // If the user is an admin, or we have a specific namespace - return one resource to watch
    if (isAdmin || namespace) {
      return {
        templates: {
          ...(namespace ? { namespace } : {}),
          kind: 'Template',
          selector: {
            matchExpressions: [
              {
                operator: 'In',
                key: TEMPLATE_TYPE_LABEL,
                values: [TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_VM],
              },
            ],
          },
          isList: true,
        },
      };
    }
    // if the user is not an admin, and we don't have a specific namespace - return all permitted resources to watch
    return Object.fromEntries(
      projects.map((p) => [
        p.metadata.name,
        {
          kind: 'Template',
          namespace: p.metadata.name,
          selector: {
            matchExpressions: [
              {
                operator: 'In',
                key: TEMPLATE_TYPE_LABEL,
                values: [TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_VM],
              },
            ],
          },
          isList: true,
        },
      ]),
    );
  }, [isAdmin, namespace, projects]);

  const resources = useK8sWatchResources<{ [key: string]: V1Template[] }>(templatesResources);

  React.useEffect(() => {
    const errorKey = Object.keys(resources).find((key) => resources[key].loadError);
    if (errorKey) {
      setLoadError(resources[errorKey].loadError);
    }
    if (
      Object.keys(resources).length > 0 &&
      Object.keys(resources).every((key) => {
        return resources[key].loaded || resources[key].loadError;
      })
    ) {
      setTemplates(Object.values(resources).flatMap((r) => r.data));
      setLoaded(true);
    }
  }, [resources]);

  return { templates, loaded, loadError };
};

type useVmTemplatesValues = {
  templates: V1Template[];
  loaded: boolean;
  loadError: any;
};
