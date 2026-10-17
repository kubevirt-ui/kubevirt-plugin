import { getUID } from '@kubevirt-utils/resources/shared';
import type { Template } from '@kubevirt-utils/resources/template/utils';

import { getGalleryTemplates } from '../stories/gallery-watch-registry';
import { sceneTemplate } from '../stories/virt-page-fixtures';

const useTemplatesWithAvailableSource = (): {
  availableDataSources: Record<string, unknown>;
  availableTemplatesUID: Set<string>;
  bootSourcesLoaded: boolean;
  error: null;
  loaded: boolean;
  templates: Template[];
} => {
  const templates = getGalleryTemplates() ?? [sceneTemplate];
  return {
    availableDataSources: {},
    availableTemplatesUID: new Set(templates.map((template) => getUID(template))),
    bootSourcesLoaded: true,
    error: null,
    loaded: true,
    templates,
  };
};

export default useTemplatesWithAvailableSource;
