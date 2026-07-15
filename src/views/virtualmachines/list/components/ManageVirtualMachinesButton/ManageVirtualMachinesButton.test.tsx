import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { VM_LIST_TAB_PARAM, VM_LIST_TAB_VMS } from '@virtualmachines/navigator/constants';

import ManageVirtualMachinesButton from './ManageVirtualMachinesButton';

const mockNavigate = jest.fn();
const mockUseActiveClusterParam = jest.fn();
const mockUseActiveNamespace = jest.fn();
const mockGetVMListPath = jest.fn();

const TAB_QUERY = `${VM_LIST_TAB_PARAM}=${VM_LIST_TAB_VMS}`;

jest.mock('react-router', () => ({
  useNavigate: (): jest.Mock => mockNavigate,
}));

jest.mock('@multicluster/hooks/useActiveClusterParam', () => ({
  __esModule: true,
  default: (): null | string => mockUseActiveClusterParam(),
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useActiveNamespace: (): [string, (ns: string) => void] => mockUseActiveNamespace(),
}));

jest.mock('@kubevirt-utils/resources/vm', () => ({
  getVMListPath: (...args: unknown[]): string => mockGetVMListPath(...args),
}));

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => ({
  useKubevirtTranslation: (): { t: (str: string) => string } => ({
    t: (str: string): string => str,
  }),
}));

describe('ManageVirtualMachinesButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseActiveClusterParam.mockReturnValue(null);
    mockUseActiveNamespace.mockReturnValue(['default', jest.fn()]);
    mockGetVMListPath.mockReturnValue('/k8s/ns/default/kubevirt.io~v1~VirtualMachine?tab=vms');
  });

  it('should navigate to the VM list path when clicked', () => {
    const vmListPath = '/k8s/ns/default/kubevirt.io~v1~VirtualMachine?tab=vms';
    mockGetVMListPath.mockReturnValue(vmListPath);

    render(<ManageVirtualMachinesButton />);

    fireEvent.click(screen.getByRole('button', { name: 'Manage VirtualMachines' }));

    expect(mockGetVMListPath).toHaveBeenCalledWith('default', null, TAB_QUERY);
    expect(mockNavigate).toHaveBeenCalledWith(vmListPath);
  });

  it('should pass the active cluster and namespace to getVMListPath', () => {
    mockUseActiveClusterParam.mockReturnValue('my-cluster');
    mockUseActiveNamespace.mockReturnValue(['my-project', jest.fn()]);

    render(<ManageVirtualMachinesButton />);

    expect(mockGetVMListPath).toHaveBeenCalledWith('my-project', 'my-cluster', TAB_QUERY);
  });

  it('should navigate to all-namespaces VM list when active namespace is all-namespaces', () => {
    const vmListPath = '/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine?tab=vms';
    mockUseActiveNamespace.mockReturnValue(['all-namespaces', jest.fn()]);
    mockGetVMListPath.mockReturnValue(vmListPath);

    render(<ManageVirtualMachinesButton />);

    fireEvent.click(screen.getByRole('button', { name: 'Manage VirtualMachines' }));

    expect(mockGetVMListPath).toHaveBeenCalledWith('all-namespaces', null, TAB_QUERY);
    expect(mockNavigate).toHaveBeenCalledWith(vmListPath);
  });

  it('should navigate to namespace VM list for a specific cluster', () => {
    const vmListPath = '/multicloud/virtualmachines/cluster/my-cluster/ns/my-project?tab=vms';
    mockUseActiveClusterParam.mockReturnValue('my-cluster');
    mockUseActiveNamespace.mockReturnValue(['my-project', jest.fn()]);
    mockGetVMListPath.mockReturnValue(vmListPath);

    render(<ManageVirtualMachinesButton />);

    fireEvent.click(screen.getByRole('button', { name: 'Manage VirtualMachines' }));

    expect(mockNavigate).toHaveBeenCalledWith(vmListPath);
  });

  it('should disable the button when getVMListPath returns an empty string', () => {
    mockGetVMListPath.mockReturnValue('');

    render(<ManageVirtualMachinesButton />);

    expect(screen.getByRole('button', { name: 'Manage VirtualMachines' })).toBeDisabled();
  });
});
