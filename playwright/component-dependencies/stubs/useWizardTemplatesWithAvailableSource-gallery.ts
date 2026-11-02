/**
 * Gallery alias for `useTemplatesWithAvailableSource` on the template catalog step.
 * Templates come from `gallery-watch-registry` / `sceneTemplate` fallback.
 */
import { getUID } from '@kubevirt-utils/resources/shared';
import type { Template } from '@kubevirt-utils/resources/template/utils';

import { getGalleryTemplates } from '../stories/gallery-watch-registry';
import { sceneTemplate } from '../stories/virt-page-fixtures';

/** Marks all gallery templates as having an available boot source. */
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
