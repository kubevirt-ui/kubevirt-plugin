import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  BOOT_SOURCE,
  isDefaultVariantTemplate,
  useVmTemplates,
} from '@kubevirt-utils/resources/template';
import { getTemplateBootSourceType } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';

import { useAvailableDataSourcesAndPVCs } from './useAvailableDataSourcesAndPVCs';

type useTemplatesWithAvailableSourceProps = {
  onlyAvailable: boolean;
  onlyDefault: boolean;
  namespace?: string;
};

export const useTemplatesWithAvailableSource = ({
  onlyAvailable,
  onlyDefault,
  namespace,
}: useTemplatesWithAvailableSourceProps): useTemplatesWithAvailableSourceValues => {
  const { templates, loaded, loadError } = useVmTemplates(namespace);
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
        if (bootSource.type === BOOT_SOURCE.PVC_AUTO_UPLOAD) {
          const ds = bootSource?.source?.sourceRef;
          if (availableDatasources.has(`${ds.namespace}-${ds.name}`)) {
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

        acc.push(template);
        return acc;
      }, [] as V1Template[]);

    return temps || [];
  }, [availableDatasources, availablePVCs, loaded, templates]);

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
    templates: filteredTemplates,
    availableTemplatesUID,
    loaded,
    bootSourcesLoaded,
    error: loadError,
  };
};

type useTemplatesWithAvailableSourceValues = {
  templates: V1Template[];
  availableTemplatesUID: Set<string>;
  loaded: boolean;
  bootSourcesLoaded: boolean;
  error: any;
};
