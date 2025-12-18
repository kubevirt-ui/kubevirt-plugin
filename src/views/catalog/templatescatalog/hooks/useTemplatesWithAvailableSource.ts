import * as React from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { getResourceFromClusterMap } from '@kubevirt-utils/resources/shared';
import {
  BOOT_SOURCE,
  isDefaultVariantTemplate,
  useVmTemplates,
} from '@kubevirt-utils/resources/template';
import { useSingleClusterAvailableSources } from '@kubevirt-utils/resources/template/hooks/useSingleClusterAvailableSources';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';

type useTemplatesWithAvailableSourceProps = {
  namespace?: string;
  onlyAvailable: boolean;
  onlyDefault: boolean;
};

export const useTemplatesWithAvailableSource = ({
  namespace,
  onlyAvailable,
  onlyDefault,
}: useTemplatesWithAvailableSourceProps): useTemplatesWithAvailableSourceValues => {
  const cluster = useClusterParam();
  const { loaded, loadError, templates } = useVmTemplates(namespace, cluster);
  const {
    availableDataSources,
    availablePVCs,
    loaded: bootSourcesLoaded,
  } = useSingleClusterAvailableSources(templates, loaded);

  const availableTemplates = React.useMemo(() => {
    const isReady = loaded && availableDataSources && availablePVCs;
    const temps =
      isReady &&
      templates.reduce((acc, template) => {
        const bootSource = getTemplateBootSourceType(template);

        // data sources
        if (bootSource.type === BOOT_SOURCE.DATA_SOURCE) {
          const ds = bootSource?.source?.sourceRef;
          if (availableDataSources[`${ds.namespace}-${ds.name}`]) {
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
    error: loadError,
    loaded,
    templates: filteredTemplates,
  };
};

type useTemplatesWithAvailableSourceValues = {
  availableDataSources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  bootSourcesLoaded: boolean;
  error: any;
  loaded: boolean;
  templates: V1Template[];
};
