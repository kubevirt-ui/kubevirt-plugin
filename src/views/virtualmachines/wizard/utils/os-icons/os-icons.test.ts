import { type V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ANNOTATIONS, type Template } from '@kubevirt-utils/resources/template';

import { getIconByOSName, getTemplateOSIcon } from './os-icons';

const makeVirtualMachineTemplate = (options?: {
  iconClass?: string;
  osAnnotation?: string;
}): Template =>
  ({
    apiVersion: 'template.kubevirt.io/v1beta1',
    kind: 'VirtualMachineTemplate',
    metadata: {
      annotations: options?.iconClass ? { [ANNOTATIONS.iconClass]: options.iconClass } : {},
      name: 'my-template',
      namespace: 'default',
      uid: 'uid-template',
    },
    spec: {
      virtualMachine: {
        spec: {
          template: {
            metadata: {
              annotations: options?.osAnnotation ? { [ANNOTATIONS.os]: options.osAnnotation } : {},
            },
            spec: {},
          },
        },
      },
    },
  }) as unknown as Template;

const makeClusterPreference = (iconClass?: string): V1beta1VirtualMachineClusterPreference =>
  ({
    apiVersion: 'instancetype.kubevirt.io/v1beta1',
    kind: 'VirtualMachineClusterPreference',
    metadata: {
      annotations: iconClass ? { [ANNOTATIONS.iconClass]: iconClass } : {},
      name: 'fedora',
    },
    spec: {},
  }) as V1beta1VirtualMachineClusterPreference;

describe('getTemplateOSIcon', () => {
  it("derives the icon from the VirtualMachineTemplate's cluster preference (CNV-102223)", () => {
    // A VirtualMachineTemplate saved from a VM created via the custom flow carries no
    // iconClass of its own; the icon comes from the referenced Preference.
    const template = makeVirtualMachineTemplate();
    const preference = makeClusterPreference('icon-fedora');

    expect(getTemplateOSIcon(template, preference)).toBe(getIconByOSName('fedora'));
  });

  it('picks a different icon for a different preference (fedora is not rhel)', () => {
    const template = makeVirtualMachineTemplate();

    const fedoraIcon = getTemplateOSIcon(template, makeClusterPreference('icon-fedora'));
    const rhelIcon = getTemplateOSIcon(template, makeClusterPreference('icon-rhel'));

    expect(fedoraIcon).toBe(getIconByOSName('fedora'));
    expect(rhelIcon).toBe(getIconByOSName('rhel'));
    expect(fedoraIcon).not.toBe(rhelIcon);
  });

  it("prefers the template's own iconClass over the preference", () => {
    const template = makeVirtualMachineTemplate({ iconClass: 'icon-rhel' });
    const preference = makeClusterPreference('icon-fedora');

    expect(getTemplateOSIcon(template, preference)).toBe(getIconByOSName('rhel'));
  });

  it('falls back to the OS annotation when no iconClass is set', () => {
    const template = makeVirtualMachineTemplate({ osAnnotation: 'fedora' });

    expect(getTemplateOSIcon(template, null)).toBe(getIconByOSName('fedora'));
  });

  it('falls back to the generic "other" icon when nothing matches', () => {
    const template = makeVirtualMachineTemplate();

    expect(getTemplateOSIcon(template, null)).toBe(getIconByOSName('other'));
  });
});
