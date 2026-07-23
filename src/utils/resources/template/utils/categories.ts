import { DEFAULT_TEMPLATE_CATEGORIES } from './constants';
import { getTemplateCategory } from './selectors';
import { isVirtualMachineTemplate, type Template } from './types';

/**
 * Collect unique category names from VirtualMachineTemplates, merged with defaults.
 * @param {Template[]} templates - templates to scan
 */
export const getAvailableTemplateCategories = (templates: Template[] = []): string[] => {
  const discovered = templates.reduce<Set<string>>((acc, template) => {
    if (!isVirtualMachineTemplate(template)) {
      return acc;
    }

    const category = getTemplateCategory(template);
    if (category) {
      acc.add(category);
    }

    return acc;
  }, new Set<string>(DEFAULT_TEMPLATE_CATEGORIES));

  return Array.from(discovered).sort((a, b) => a.localeCompare(b));
};
