import { useMemo } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { OPENSHIFT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import useListMulticlusterFilters from '@kubevirt-utils/hooks/useListMulticlusterFilters';
import {
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_TYPE_VM,
} from '@kubevirt-utils/resources/template';
import { TemplateModelGroupVersionKind } from '@kubevirt-utils/resources/template/hooks/constants';
import { Operator, Selector } from '@openshift-console/dynamic-plugin-sdk';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';

type UseOpenShiftTemplates = (props: {
  fieldSelector?: string;
  namespace?: string;
  selector?: Selector;
}) => {
  error: any;
  loaded: boolean;
  templates: V1Template[];
};

export const useOpenShiftTemplates: UseOpenShiftTemplates = ({
  fieldSelector,
  namespace,
  selector,
}) => {
  const multiclusterFilters = useListMulticlusterFilters();
  const clusters = useListClusters();
  const cluster = clusters?.length === 1 ? clusters[0] : undefined;

  const templateWatchNamespaces = useMemo(
    () => (namespace ? [OPENSHIFT_NAMESPACE, namespace] : [OPENSHIFT_NAMESPACE]),
    [namespace],
  );

  const templateMulticlusterFilters = useMemo(
    () => [
      ...multiclusterFilters,
      {
        property: 'label',
        values: [
          `${TEMPLATE_TYPE_LABEL}=${TEMPLATE_TYPE_BASE}`,
          `${TEMPLATE_TYPE_LABEL}=${TEMPLATE_TYPE_VM}`,
        ],
      },
    ],
    [multiclusterFilters],
  );

  const {
    loaded,
    loadError,
    resources: templates,
  } = useAccessibleResources<V1Template>({
    clusters: cluster ? [cluster] : undefined,
    fieldSelector,
    groupVersionKind: TemplateModelGroupVersionKind,
    namespace,
    searchQueries: templateMulticlusterFilters,
    selector: {
      ...(selector || {}),
      matchExpressions: [
        ...(selector?.matchExpressions || []),
        {
          key: TEMPLATE_TYPE_LABEL,
          operator: Operator.In,
          values: [TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_VM],
        },
      ],
    },
    watchNamespaces: templateWatchNamespaces,
  });

  return {
    error: loadError,
    loaded,
    templates: templates ?? [],
  };
};
