import { type V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ANNOTATIONS, type Template } from '@kubevirt-utils/resources/template';
import { render, screen } from '@testing-library/react';
import { getIconByOSName } from '@virtualmachines/wizard/utils/os-icons/os-icons';

import TemplatesCatalogTile from './TemplatesCatalogTile';

// The CPU/memory subtree watches instance types via a k8s hook that needs a provider;
// it is unrelated to the icon behaviour under test, so stub it out.
jest.mock('@kubevirt-utils/components/TemplateCPUMemoryDisplay/TemplateCPUMemoryDisplay', () => ({
  __esModule: true,
  default: () => null,
}));

const TEMPLATE_NAME = 'my-template';

const makeVirtualMachineTemplate = (): Template =>
  ({
    apiVersion: 'template.kubevirt.io/v1beta1',
    kind: 'VirtualMachineTemplate',
    metadata: {
      // No iconClass of its own: the icon must come from the preference.
      annotations: {},
      name: TEMPLATE_NAME,
      namespace: 'default',
      uid: 'uid-template',
    },
    spec: {
      virtualMachine: { spec: { template: { metadata: { annotations: {} }, spec: {} } } },
    },
  }) as Template;

const makeClusterPreference = (iconClass: string): V1beta1VirtualMachineClusterPreference =>
  ({
    apiVersion: 'instancetype.kubevirt.io/v1beta1',
    kind: 'VirtualMachineClusterPreference',
    metadata: { annotations: { [ANNOTATIONS.iconClass]: iconClass }, name: 'pref' },
    spec: {},
  }) as V1beta1VirtualMachineClusterPreference;

const renderTemplateTile = (clusterPreference: V1beta1VirtualMachineClusterPreference) =>
  render(
    <TemplatesCatalogTile
      clusterPreference={clusterPreference}
      onClick={jest.fn()}
      osDisplayNames={{}}
      template={makeVirtualMachineTemplate()}
    />,
  );

describe('TemplatesCatalogTile', () => {
  it('renders the fedora icon for a VirtualMachineTemplate with a fedora preference (CNV-102223)', () => {
    renderTemplateTile(makeClusterPreference('icon-fedora'));

    const icon = screen.getByRole('img', { name: `${TEMPLATE_NAME} icon` });
    expect(icon).toHaveAttribute('src', getIconByOSName('fedora'));
  });

  it('renders the rhel icon for a VirtualMachineTemplate with a rhel preference (CNV-102223)', () => {
    renderTemplateTile(makeClusterPreference('icon-rhel'));

    const icon = screen.getByRole('img', { name: `${TEMPLATE_NAME} icon` });
    expect(icon).toHaveAttribute('src', getIconByOSName('rhel'));
    expect(icon).not.toHaveAttribute('src', getIconByOSName('fedora'));
  });
});
