import React, { useMemo } from 'react';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import useListMulticlusterFilters from '@kubevirt-utils/hooks/useListMulticlusterFilters';
import {
  ClusterNamespacedResourceMap,
  getResourceFromClusterMap,
} from '@kubevirt-utils/resources/shared';
import {
  BOOT_SOURCE,
  isDefaultVariantTemplate,
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_TYPE_VM,
} from '@kubevirt-utils/resources/template';
import useAvailableSources from '@kubevirt-utils/resources/template/hooks/useAvailableSources';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import {
  getGroupVersionKindForModel,
  Operator,
  Selector,
} from '@openshift-console/dynamic-plugin-sdk';

type useTemplatesWithAvailableSourceProps = {
  fieldSelector?: string;
  namespace?: string;
  onlyAvailable: boolean;
  onlyDefault: boolean;
  selector?: Selector;
};

export const useTemplatesWithAvailableSource = ({
  fieldSelector,
  namespace,
  onlyAvailable,
  onlyDefault,
  selector,
}: useTemplatesWithAvailableSourceProps): useTemplatesWithAvailableSourceValues => {
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
        ...(selector || []),
        matchExpressions: [
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

  const { availableDataSources, availablePVCs, bootSourcesLoaded, cloneInProgressDataSources } =
    useAvailableSources(templates, loaded);

  const availableTemplates = useMemo(() => {
    const isReady = loaded && availableDataSources && availablePVCs;
    const temps =
      isReady &&
      templates.reduce((acc, template) => {
        const bootSource = getTemplateBootSourceType(template);

        // data sources
        if (bootSource.type === BOOT_SOURCE.DATA_SOURCE) {
          const ds = bootSource?.source?.sourceRef;
          if (
            getResourceFromClusterMap(
              availableDataSources,
              getCluster(template),
              ds.namespace,
              ds.name,
            )
          ) {
            acc.push(template);
          }
          return acc;
        }

        // pvcs
        if (bootSource.type === BOOT_SOURCE.PVC) {
          const pvc = bootSource?.source?.pvc;
          if (
            getResourceFromClusterMap(availablePVCs, getCluster(template), pvc.namespace, pvc.name)
          ) {
            acc.push(template);
          }
          return acc;
        }

        if (bootSource.type !== BOOT_SOURCE.NONE) {
          acc.push(template);
        }
        return acc;
      }, [] as V1Template[]);

    return temps || [];
  }, [availableDataSources, availablePVCs, loaded, templates]);

  const filteredTemplates = React.useMemo(() => {
    return (onlyAvailable ? availableTemplates : templates).filter((template) =>
      onlyDefault ? isDefaultVariantTemplate(template) : true,
    );
  }, [availableTemplates, onlyAvailable, onlyDefault, templates]);

  const availableTemplatesUID = React.useMemo(
    () => new Set(availableTemplates.map((template) => template.metadata.uid)),
    [availableTemplates],
  );

  return {
    availableDataSources,
    availableTemplatesUID,
    bootSourcesLoaded,
    cloneInProgressDataSources,
    error: loadError,
    loaded,
    templates: filteredTemplates,
  };
};

type useTemplatesWithAvailableSourceValues = {
  availableDataSources: ClusterNamespacedResourceMap<V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  bootSourcesLoaded: boolean;
  cloneInProgressDataSources: ClusterNamespacedResourceMap<V1beta1DataSource>;
  error: any;
  loaded: boolean;
  templates: V1Template[];
};
