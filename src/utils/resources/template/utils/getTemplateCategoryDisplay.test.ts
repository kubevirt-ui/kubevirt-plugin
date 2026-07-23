import { type TFunction } from 'i18next';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

import { TEMPLATE_CATEGORY_LABEL, TEMPLATE_TYPE_LABEL, TEMPLATE_TYPE_VM } from './constants';
import { getTemplateCategoryDisplay } from './getTemplateCategoryDisplay';
import { type Template } from './types';

const t = ((key: string) => key) as TFunction;

const createVmTemplate = (category?: string): Template =>
  ({
    apiVersion: 'template.kubevirt.io/v1alpha1',
    kind: 'VirtualMachineTemplate',
    metadata: {
      labels: {
        [TEMPLATE_TYPE_LABEL]: TEMPLATE_TYPE_VM,
        ...(category ? { [TEMPLATE_CATEGORY_LABEL]: category } : {}),
      },
      name: 'vm-tpl',
    },
  }) as unknown as Template;

const createOpenShiftTemplate = (workload?: string): Template =>
  ({
    apiVersion: 'template.openshift.io/v1',
    kind: 'Template',
    metadata: {
      labels: workload ? { [`workload.template.kubevirt.io/${workload}`]: 'true' } : undefined,
      name: 'os-tpl',
    },
  }) as unknown as Template;

describe('getTemplateCategoryDisplay', () => {
  it('returns the category label value for a VM template', () => {
    expect(getTemplateCategoryDisplay(createVmTemplate('Databases'), t)).toBe('Databases');
  });

  it('returns a custom category as-is for a VM template', () => {
    expect(getTemplateCategoryDisplay(createVmTemplate('my-custom'), t)).toBe('my-custom');
  });

  it('returns a dash when a VM template has no category', () => {
    expect(getTemplateCategoryDisplay(createVmTemplate(), t)).toBe(NO_DATA_DASH);
  });

  it('returns the workload profile for a known OpenShift template workload', () => {
    expect(getTemplateCategoryDisplay(createOpenShiftTemplate('server'), t)).toBe('Server');
  });

  it('returns a dash for a missing or unknown OpenShift workload', () => {
    expect(getTemplateCategoryDisplay(createOpenShiftTemplate(), t)).toBe(NO_DATA_DASH);
    expect(getTemplateCategoryDisplay(createOpenShiftTemplate('unknown'), t)).toBe(NO_DATA_DASH);
  });
});
