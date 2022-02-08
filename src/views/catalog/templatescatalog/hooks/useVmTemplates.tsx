import * as React from 'react';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import {
  K8sResourceCommon,
  useK8sWatchResource,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';

import { TemplateKind } from '../types/template';
import { TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_LABEL, TEMPLATE_TYPE_VM } from '../utils/constants';

export const useVmTemplates = (): useVmTemplatesValues => {
  const [templates, setTemplates] = React.useState<TemplateKind[]>([]);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string>('');
  const [isAdmin] = useIsAdmin();

  const [projects] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: {
      group: 'project.openshift.io',
      version: 'v1',
      kind: 'Project',
    },
    namespaced: false,
    isList: true,
  });

  const templatesResources = React.useMemo(
    () =>
      isAdmin
        ? {
            templates: {
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
          }
        : Object.fromEntries(
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
          ),
    [isAdmin, projects],
  );

  const resources = useK8sWatchResources(templatesResources);

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
  templates: TemplateKind[];
  loaded: boolean;
  loadError: any;
};
