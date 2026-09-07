import { getAnnotations } from '@kubevirt-utils/resources/shared';
import { isOpenShiftTemplate, type Template } from '@kubevirt-utils/resources/template';
import { NAME_OS_TEMPLATE_ANNOTATION } from '@kubevirt-utils/resources/vm';

const NAME_OS_PREFIX = `${NAME_OS_TEMPLATE_ANNOTATION}/`;

/**
 * Builds a map from OS key (e.g. "centos-stream9") to human-readable name
 * (e.g. "CentOS Stream 9") by extracting name.os.template.kubevirt.io/*
 * annotations from all OpenShift templates.
 */
export const buildOSDisplayNameMap = (templates: Template[]): Record<string, string> => {
  const map: Record<string, string> = {};

  for (const template of templates) {
    if (!isOpenShiftTemplate(template)) continue;

    const annotations = getAnnotations(template);
    if (!annotations) continue;

    for (const [key, value] of Object.entries(annotations)) {
      if (key.startsWith(NAME_OS_PREFIX) && value) {
        const osKey = key.slice(NAME_OS_PREFIX.length);
        map[osKey] ??= value;
      }
    }
  }
  return map;
};
