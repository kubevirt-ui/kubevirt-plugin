import { TEMPLATE_CATEGORY_LABEL } from './constants';
import { getTemplateCategory } from './selectors';
import { type Template } from './types';

const createVmTemplate = (category?: string): Template =>
  ({
    apiVersion: 'template.kubevirt.io/v1alpha1',
    kind: 'VirtualMachineTemplate',
    metadata: {
      labels: category ? { [TEMPLATE_CATEGORY_LABEL]: category } : undefined,
      name: 'vm-tpl',
    },
  }) as unknown as Template;

const createOpenShiftTemplate = (): Template =>
  ({
    apiVersion: 'template.openshift.io/v1',
    kind: 'Template',
    metadata: {
      labels: { [TEMPLATE_CATEGORY_LABEL]: 'ignored' },
      name: 'os-tpl',
    },
  }) as unknown as Template;

describe('getTemplateCategory', () => {
  it('returns the category for a VirtualMachineTemplate', () => {
    expect(getTemplateCategory(createVmTemplate('databases'))).toBe('databases');
  });

  it('returns undefined when the category label is missing', () => {
    expect(getTemplateCategory(createVmTemplate())).toBeUndefined();
  });

  it('returns undefined for a non-VM template', () => {
    expect(getTemplateCategory(createOpenShiftTemplate())).toBeUndefined();
  });
});
