import { useMemo } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { getUID } from '@kubevirt-utils/resources/shared';
import { Template } from '@kubevirt-utils/resources/template';
import { useSingleClusterAvailableSources } from '@kubevirt-utils/resources/template/hooks/useSingleClusterAvailableSources';
import { getAvailableTemplates } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/utils/getAvailableTemplates';

import useTemplates from './useTemplates';

type UseTemplatesWithAvailableSource = (args: { namespace?: string }) => {
  availableDataSources: Record<string, V1beta1DataSource>;
  availableTemplatesUID: Set<string>;
  bootSourcesLoaded: boolean;
  error: any;
  loaded: boolean;
  templates: Template[];
};

const useTemplatesWithAvailableSource: UseTemplatesWithAvailableSource = ({ namespace }) => {
  const { allTemplates: templates, error: loadError, loaded } = useTemplates(namespace);

  const {
    availableDataSources,
    availablePVCs,
    loaded: bootSourcesLoaded,
  } = useSingleClusterAvailableSources(templates, loaded);

  const availableTemplatesUID = useMemo(() => {
    const availableTemplates = getAvailableTemplates(
      availableDataSources,
      availablePVCs,
      templates,
      loaded,
    );
    return new Set(availableTemplates.map((template) => getUID(template)));
  }, [availableDataSources, availablePVCs, templates, loaded]);

  return {
    availableDataSources,
    availableTemplatesUID,
    bootSourcesLoaded,
    error: loadError,
    loaded,
    templates,
  };
};

export default useTemplatesWithAvailableSource;
