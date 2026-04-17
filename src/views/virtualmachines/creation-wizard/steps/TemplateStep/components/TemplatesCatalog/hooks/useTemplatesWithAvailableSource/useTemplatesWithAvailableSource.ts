import { useMemo } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { getUID } from '@kubevirt-utils/resources/shared';
import { isDefaultVariantTemplate, Template } from '@kubevirt-utils/resources/template';
import { useSingleClusterAvailableSources } from '@kubevirt-utils/resources/template/hooks/useSingleClusterAvailableSources';
import useAvailableTemplates from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/hooks/useTemplatesWithAvailableSource/useAvailableTemplates';
import useTemplates from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/hooks/useTemplatesWithAvailableSource/useTemplates';

type UseTemplatesWithAvailableSource = (args: {
  namespace?: string;
  onlyAvailable: boolean;
  onlyDefault: boolean;
}) => {
  availableDataSources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  bootSourcesLoaded: boolean;
  error: any;
  loaded: boolean;
  templates: Template[];
};

const useTemplatesWithAvailableSource: UseTemplatesWithAvailableSource = ({
  namespace,
  onlyAvailable,
  onlyDefault,
}) => {
  const { allTemplates: templates, error: loadError, loaded } = useTemplates(namespace);

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
    () => new Set(availableTemplates.map((template) => getUID(template))),
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

export default useTemplatesWithAvailableSource;
