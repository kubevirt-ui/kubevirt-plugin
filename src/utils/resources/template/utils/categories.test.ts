import { getAvailableTemplateCategories } from './categories';
import { DEFAULT_TEMPLATE_CATEGORIES, TEMPLATE_CATEGORY_LABEL } from './constants';
import { type Template } from './types';

const createVmTemplate = (name: string, category?: string): Template =>
  ({
    apiVersion: 'template.kubevirt.io/v1alpha1',
    kind: 'VirtualMachineTemplate',
    metadata: {
      labels: category ? { [TEMPLATE_CATEGORY_LABEL]: category } : undefined,
      name,
    },
  }) as unknown as Template;

const createOpenShiftTemplate = (name: string, category: string): Template =>
  ({
    apiVersion: 'template.openshift.io/v1',
    kind: 'Template',
    metadata: {
      labels: { [TEMPLATE_CATEGORY_LABEL]: category },
      name,
    },
  }) as unknown as Template;

describe('getAvailableTemplateCategories', () => {
  it('returns default categories when no templates are provided', () => {
    expect(getAvailableTemplateCategories()).toEqual(
      [...DEFAULT_TEMPLATE_CATEGORIES].sort((a, b) => a.localeCompare(b)),
    );
  });

  it('discovers categories from VirtualMachineTemplates', () => {
    const categories = getAvailableTemplateCategories([
      createVmTemplate('db-tpl', 'custom-db'),
      createVmTemplate('sec-tpl', 'security'),
    ]);

    expect(categories).toContain('custom-db');
    expect(categories).toContain('security');
    expect(categories).toEqual(expect.arrayContaining([...DEFAULT_TEMPLATE_CATEGORIES]));
  });

  it('excludes categories from OpenShift templates', () => {
    const categories = getAvailableTemplateCategories([
      createOpenShiftTemplate('os-tpl', 'should-not-appear'),
      createVmTemplate('vm-tpl', 'custom-vm'),
    ]);

    expect(categories).not.toContain('should-not-appear');
    expect(categories).toContain('custom-vm');
  });

  it('deduplicates discovered categories', () => {
    const categories = getAvailableTemplateCategories([
      createVmTemplate('a', 'custom'),
      createVmTemplate('b', 'custom'),
    ]);

    expect(categories.filter((category) => category === 'custom')).toHaveLength(1);
  });

  it('sorts categories locale-aware', () => {
    const categories = getAvailableTemplateCategories([
      createVmTemplate('z', 'zeta'),
      createVmTemplate('a', 'alpha'),
    ]);

    expect(categories.indexOf('alpha')).toBeLessThan(categories.indexOf('zeta'));
  });
});
