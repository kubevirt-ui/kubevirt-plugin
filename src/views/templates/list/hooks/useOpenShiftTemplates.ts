import { useMemo } from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import useListMulticlusterFilters from '@kubevirt-utils/hooks/useListMulticlusterFilters';
import {
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_TYPE_VM,
} from '@kubevirt-utils/resources/template';
import {
  getGroupVersionKindForModel,
  Operator,
  Selector,
} from '@openshift-console/dynamic-plugin-sdk';

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

  const [templates, loaded, loadError] = useKubevirtWatchResource<V1Template[]>(
    {
      cluster,
      fieldSelector,
      groupVersionKind: getGroupVersionKindForModel(TemplateModel),
      isList: true,
      namespace,
      namespaced: true,
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
    },
    null,
    templateMulticlusterFilters,
  );

  return {
    error: loadError,
    loaded,
    templates: templates ?? [],
  };
};
