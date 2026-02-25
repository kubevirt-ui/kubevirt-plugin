import { useMemo } from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { isDefaultVariantTemplate, useVmTemplates } from '@kubevirt-utils/resources/template';
import { useSingleClusterAvailableSources } from '@kubevirt-utils/resources/template/hooks/useSingleClusterAvailableSources';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useAvailableTemplates from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/hooks/useTemplatesWithAvailableSource/useAvailableTemplates';

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

  const availableTemplates = useAvailableTemplates(
    availableDataSources,
    availablePVCs,
    templates,
    loaded,
  );

  const filteredTemplates = useMemo(() => {
    return (onlyAvailable ? availableTemplates : templates).filter((template) =>
      onlyDefault ? isDefaultVariantTemplate(template) : true,
    );
  }, [availableTemplates, onlyAvailable, onlyDefault, templates]);

  const availableTemplatesUID = useMemo(
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
