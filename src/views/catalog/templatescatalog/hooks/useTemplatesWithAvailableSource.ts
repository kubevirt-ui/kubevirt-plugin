import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  BOOT_SOURCE,
  isCustomTemplate,
  isDefaultVariantTemplate,
  useVmTemplates,
} from '@kubevirt-utils/resources/template';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';

import { useAvailableDataSourcesAndPVCs } from './useAvailableDataSourcesAndPVCs';

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
  const { loaded, loadError, templates } = useVmTemplates(namespace);
  const {
    availableDatasources,
    availablePVCs,
    loaded: bootSourcesLoaded,
  } = useAvailableDataSourcesAndPVCs(templates, loaded);

  const availableTemplates = React.useMemo(() => {
    const isReady = loaded && availableDatasources && availablePVCs;
    const temps =
      isReady &&
      templates.reduce((acc, template) => {
        const bootSource = getTemplateBootSourceType(template);

        // data sources
        if (bootSource.type === BOOT_SOURCE.DATA_SOURCE) {
          const ds = bootSource?.source?.sourceRef;
          if (availableDatasources[`${ds.namespace}-${ds.name}`]) {
            acc.push(template);
          }
          return acc;
        }

        // pvcs
        if (bootSource.type === BOOT_SOURCE.PVC) {
          const pvc = bootSource?.source?.pvc;
          if (availablePVCs.has(`${pvc.namespace}-${pvc.name}`)) {
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
  }, [availableDatasources, availablePVCs, loaded, templates]);

  const filteredTemplates = React.useMemo(() => {
    return (onlyAvailable ? availableTemplates : templates).filter((template) =>
      onlyDefault ? isDefaultVariantTemplate(template) || isCustomTemplate(template) : true,
    );
  }, [availableTemplates, onlyAvailable, onlyDefault, templates]);

  const availableTemplatesUID = React.useMemo(
    () => new Set(availableTemplates.map((template) => template.metadata.uid)),
    [availableTemplates],
  );

  return {
    availableDatasources,
    availableTemplatesUID,
    bootSourcesLoaded,
    error: loadError,
    loaded,
    templates: filteredTemplates,
  };
};

type useTemplatesWithAvailableSourceValues = {
  availableDatasources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  bootSourcesLoaded: boolean;
  error: any;
  loaded: boolean;
  templates: V1Template[];
};
