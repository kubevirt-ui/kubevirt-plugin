import type { Template } from '@kubevirt-utils/resources/template';

import { getGalleryTemplates } from '../stories/gallery-watch-registry';

type UseOpenShiftTemplatesResult = {
  error: unknown;
  loaded: boolean;
  templates: Template[];
};

export const useOpenShiftTemplates = (_props?: {
  clusterOverride?: string;
  fieldSelector?: string;
  namespace?: string;
}): UseOpenShiftTemplatesResult => ({
  error: null,
  loaded: true,
  templates: (getGalleryTemplates() ?? []) as Template[],
});
