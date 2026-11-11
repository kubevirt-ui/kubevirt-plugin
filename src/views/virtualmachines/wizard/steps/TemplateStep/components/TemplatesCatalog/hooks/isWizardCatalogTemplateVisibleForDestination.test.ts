import {
  TemplateModel,
  VirtualMachineInstancetypeModel,
  VirtualMachineModel,
  VirtualMachineTemplateModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type Template } from '@kubevirt-utils/resources/template';

import { isWizardCatalogTemplateVisibleForDestination } from './isWizardCatalogTemplateVisibleForDestination';

const vmTemplateWithInstanceType = (
  templateNamespace: string,
  instancetype: { kind?: string; name: string },
): Template =>
  ({
    kind: VirtualMachineTemplateModel.kind,
    metadata: { name: 'vm-tpl', namespace: templateNamespace },
    spec: {
      virtualMachine: {
        kind: VirtualMachineModel.kind,
        spec: {
          instancetype: { ...instancetype },
          template: { spec: { domain: { devices: {} } } },
        },
      },
    },
  }) as Template;

const openshiftTemplate = (): Template =>
  ({
    kind: TemplateModel.kind,
    metadata: { name: 'os-tpl', namespace: 'openshift' },
    objects: [],
  }) as Template;

describe('isWizardCatalogTemplateVisibleForDestination', () => {
  it('keeps cluster instance type VM templates regardless of destination', () => {
    const template = vmTemplateWithInstanceType('other-ns', { name: 'u1.small' });

    expect(isWizardCatalogTemplateVisibleForDestination(template, 'dest-ns')).toBe(true);
  });

  it('keeps namespaced instance type VM templates when template namespace matches destination', () => {
    const template = vmTemplateWithInstanceType('dest-ns', {
      kind: VirtualMachineInstancetypeModel.kind,
      name: 'my-it',
    });

    expect(isWizardCatalogTemplateVisibleForDestination(template, 'dest-ns')).toBe(true);
  });

  it('hides namespaced instance type VM templates when template namespace differs from destination', () => {
    const template = vmTemplateWithInstanceType('other-ns', {
      kind: VirtualMachineInstancetypeModel.kind,
      name: 'my-it',
    });

    expect(isWizardCatalogTemplateVisibleForDestination(template, 'dest-ns')).toBe(false);
  });

  it('does not filter OpenShift templates', () => {
    expect(isWizardCatalogTemplateVisibleForDestination(openshiftTemplate(), 'dest-ns')).toBe(true);
  });
});
