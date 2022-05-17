import React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { BOOT_SOURCE } from '@kubevirt-utils/resources/template';
import {
  getDataSource,
  getPVC,
  getTemplateBootSourceType,
  isDataSourceReady,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';

import { assertFulfilled, getSourcePromises } from './utils';

type UniqueSourceType = {
  [namespace: string]: Set<string>;
};

/**
 * Hook that returns the DataSources and PVCs that are available for the templates
 * @param templates - the templates to filter
 * @param templatesLoaded - whether the templates are loaded
 * @returns availablePVCs and availableDatasources, both Sets of strings representing the available sources. `{namespace-name}`
 */
export const useAvailableDataSourcesAndPVCs = (
  templates: V1Template[],
  templatesLoaded: boolean,
) => {
  const [availableDatasources, setAvailableDatasources] = React.useState<
    Record<string, V1beta1DataSource>
  >({});
  const [availablePVCs, setAvailablePVCs] = React.useState<Set<string>>();
  const [loaded, setLoaded] = React.useState(false);

  const uniqueSources = React.useMemo(() => {
    if (templatesLoaded) {
      const dataSources: UniqueSourceType = {};
      const pvcs: UniqueSourceType = {};

      templates.forEach((t) => {
        const bootSource = getTemplateBootSourceType(t);

        if (bootSource.type === BOOT_SOURCE.DATA_SOURCE) {
          const ds = bootSource?.source?.sourceRef;
          dataSources[ds?.namespace] = new Set([...(dataSources?.[ds?.namespace] || []), ds?.name]);
        }

        if (bootSource.type === BOOT_SOURCE.PVC) {
          const pvc = bootSource?.source?.pvc;
          pvcs[pvc?.namespace] = new Set([...(pvcs?.[pvc?.namespace] || []), pvc?.name]);
        }
      });

      return { uniqueDataSources: dataSources, uniquePVCs: pvcs };
    }
  }, [templates, templatesLoaded]);

  React.useEffect(() => {
    if (uniqueSources) {
      setLoaded(false);
      const { uniqueDataSources, uniquePVCs } = uniqueSources;
      const dataSourcesPromises = getSourcePromises(getDataSource, uniqueDataSources);
      const pvcPromises = getSourcePromises(getPVC, uniquePVCs);

      Promise.allSettled([dataSourcesPromises, pvcPromises])
        .then((sources) => {
          const [dataSources, pvcs] = sources.filter(assertFulfilled);
          const dataSourcesSet = dataSources.value.filter(assertFulfilled).reduce((acc, curr) => {
            if (isDataSourceReady(curr.value)) {
              acc[`${curr?.value?.metadata?.namespace}-${curr?.value?.metadata?.name}`] =
                curr?.value;
            }
            return acc;
          }, {});

          const pvcSet = new Set(
            pvcs.value
              .filter(assertFulfilled)
              .map((pvc) => `${pvc?.value.metadata?.namespace}-${pvc?.value.metadata?.name}`),
          );

          setAvailableDatasources(dataSourcesSet || {});
          setAvailablePVCs(pvcSet || new Set());
        })
        .catch(console.error)
        .finally(() => setLoaded(true));
    }
  }, [uniqueSources]);

  return { availableDatasources, availablePVCs, loaded };
};
