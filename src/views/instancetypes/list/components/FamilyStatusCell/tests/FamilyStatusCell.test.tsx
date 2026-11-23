import React from 'react';

import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useDisabledInstanceTypeFamilies from '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies';
import { render, screen } from '@testing-library/react';

import FamilyStatusCell from '../FamilyStatusCell';

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => {
  const t = (key: string) => key;
  return { t, useKubevirtTranslation: () => ({ t }) };
});

jest.mock(
  '@kubevirt-utils/hooks/useInstanceTypeFamilyAvailability/useDisabledInstanceTypeFamilies',
  () => ({ __esModule: true, default: jest.fn() }),
);

const mockUseDisabledFamilies = useDisabledInstanceTypeFamilies as jest.Mock;

const instanceType = (name: string, vendor?: string): V1beta1VirtualMachineClusterInstancetype =>
  ({
    metadata: {
      labels: vendor ? { 'instancetype.kubevirt.io/vendor': vendor } : {},
      name,
    },
  } as V1beta1VirtualMachineClusterInstancetype);

describe('FamilyStatusCell', () => {
  beforeEach(() => {
    mockUseDisabledFamilies.mockReturnValue({
      disabledFamilies: new Set(['cx1']),
      loaded: true,
    });
  });

  it('shows a skeleton while family availability is loading', () => {
    mockUseDisabledFamilies.mockReturnValue({ disabledFamilies: new Set(), loaded: false });
    const { container } = render(
      <FamilyStatusCell row={instanceType('u1.medium', 'redhat.com')} />,
    );

    expect(container.querySelector('.pf-v6-c-skeleton')).toBeInTheDocument();
  });

  it('shows "Shown in selectors" for an enabled Red Hat family', () => {
    render(<FamilyStatusCell row={instanceType('u1.medium', 'redhat.com')} />);

    expect(screen.getByText('Shown in selectors')).toBeInTheDocument();
  });

  it('shows "Hidden from selectors" for a disabled Red Hat family', () => {
    render(<FamilyStatusCell row={instanceType('cx1.medium', 'redhat.com')} />);

    expect(screen.getByText('Hidden from selectors')).toBeInTheDocument();
  });

  it('shows a dash for non Red Hat instance types', () => {
    render(<FamilyStatusCell row={instanceType('custom.medium')} />);

    expect(screen.queryByText('Shown in selectors')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden from selectors')).not.toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
