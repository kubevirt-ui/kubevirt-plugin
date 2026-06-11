import { useMemo } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  ClusterNamespacedResourceMap,
  getResourceFromClusterMap,
} from '@kubevirt-utils/resources/shared';
import { BOOT_SOURCE, Template } from '@kubevirt-utils/resources/template';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getCluster } from '@multicluster/helpers/selectors';

type UseAvailableTemplates = (
  availableDataSources: object,
  availablePVCs: ClusterNamespacedResourceMap<IoK8sApiCoreV1PersistentVolumeClaim>,
  templates: Template[],
  templatesLoaded: boolean,
) => Template[];

const useAvailableTemplates: UseAvailableTemplates = (
  availableDataSources,
  availablePVCs,
  templates,
  templatesLoaded,
) => {
  return useMemo(() => {
    const isReady = templatesLoaded && availableDataSources && availablePVCs;
    const temps =
      isReady &&
      templates.reduce((acc, template) => {
        const bootSource = getTemplateBootSourceType(template);

        // data sources
        if (bootSource.type === BOOT_SOURCE.DATA_SOURCE) {
          const ds = bootSource?.source?.sourceRef;
          if (ds?.namespace && ds?.name && availableDataSources[`${ds.namespace}-${ds.name}`]) {
            acc.push(template);
          }
          return acc;
        }

        // pvcs
        if (bootSource.type === BOOT_SOURCE.PVC) {
          const pvc = bootSource?.source?.pvc;
          if (
            pvc?.namespace &&
            pvc?.name &&
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
      }, [] as Template[]);

    return temps || [];
  }, [availableDataSources, availablePVCs, templatesLoaded, templates]);
};

export default useAvailableTemplates;
