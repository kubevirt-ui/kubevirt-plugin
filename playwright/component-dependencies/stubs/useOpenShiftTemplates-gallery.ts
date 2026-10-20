/**
 * Gallery alias for `@templates/list/hooks/useOpenShiftTemplates`.
 * Template list from the gallery watch registry.
 */
import type { Template } from '@kubevirt-utils/resources/template';

import { getGalleryTemplates } from '../stories/gallery-watch-registry';

type UseOpenShiftTemplatesResult = {
  error: unknown;
  loaded: boolean;
  templates: Template[];
};

/** Loaded templates for catalog toolbar / project filters in scenes. */
export const useOpenShiftTemplates = (_props?: {
  clusterOverride?: string;
  fieldSelector?: string;
  namespace?: string;
}): UseOpenShiftTemplatesResult => ({
  error: null,
  loaded: true,
  templates: (getGalleryTemplates() ?? []) as Template[],
});
