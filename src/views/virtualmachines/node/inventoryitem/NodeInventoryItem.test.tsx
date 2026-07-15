import React from 'react';

import { getVMStatuses } from '@overview/OverviewTab/vm-statuses-card/utils/utils';
import { render, screen } from '@testing-library/react';
import {
  createNode,
  createVM,
  mockLoadedState,
  mockUseAccessibleResources,
  mockUseVirtualMachineInstanceMapper,
} from '@virtualmachines/node/inventoryitem/NodeInventoryItem.test-utils';

import { NodeInventoryItem } from './NodeInventoryItem';

const mockUseParams = jest.fn();

jest.mock('@kubevirt-utils/resources/shared', () => ({
  getName: (obj: { metadata?: { name?: string } }): string | undefined => obj?.metadata?.name,
}));

jest.mock('@virtualmachines/utils/mappers', () => ({
  getVMIFromMapper: (
    vmiMapper: {
      mapper: {
        [cluster: string]: {
          [namespace: string]: { [name: string]: { status?: { nodeName?: string } } };
        };
      };
    },
    virtualMachine: { metadata?: { name?: string; namespace?: string } },
  ): { status?: { nodeName?: string } } | undefined =>
    vmiMapper?.mapper?.['#single-cluster#']?.[virtualMachine?.metadata?.namespace ?? '']?.[
      virtualMachine?.metadata?.name ?? ''
    ],
}));

jest.mock('@kubevirt-utils/resources/vmi', () => ({
  getVMINodeName: (vmi: { status?: { nodeName?: string } }): string | undefined =>
    vmi?.status?.nodeName,
}));

jest.mock('@overview/OverviewTab/vm-statuses-card/utils/utils', () => {
  const mockErrorIcon = (): React.ReactElement => <span data-test-id="error-icon" />;
  const mockRunningIcon = (): React.ReactElement => <span data-test-id="running-icon" />;
  const mockStoppedIcon = (): React.ReactElement => <span data-test-id="stopped-icon" />;

  return {
    getVMStatuses: jest.fn(() => ({
      otherStatuses: {},
      otherStatusesCount: 0,
      primaryStatuses: { Error: 0, Running: 0, Stopped: 0 },
    })),
    vmStatusIcon: {
      Error: mockErrorIcon,
      Running: mockRunningIcon,
      Stopped: mockStoppedIcon,
    },
  };
});

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => {
  const t = (key: string, params?: Record<string, string>): string => {
    let result = key;
    if (params) {
      Object.entries(params).forEach(([objKey, value]) => {
        result = result.replace(`{{${objKey}}}`, String(value));
      });
    }
    return result;
  };
  return {
    t,
    useKubevirtTranslation: (): {
      t: (key: string, params?: Record<string, string>) => string;
    } => ({ t }),
  };
});

jest.mock('@virtualmachines/search/hooks/useAccessibleResources', () => ({
  useAccessibleResources: (): ReturnType<typeof mockUseAccessibleResources> =>
    mockUseAccessibleResources(),
}));

jest.mock('@virtualmachines/list/hooks/useVirtualMachineInstanceMapper', () => ({
  useVirtualMachineInstanceMapper: (): ReturnType<typeof mockUseVirtualMachineInstanceMapper> =>
    mockUseVirtualMachineInstanceMapper(),
}));

jest.mock('react-router', () => {
  const MockLink = ({
    children,
    to,
  }: {
    children: React.ReactNode;
    to: string;
  }): React.ReactElement => <a href={to}>{children}</a>;

  return {
    Link: MockLink,
    useParams: (): Record<string, string | undefined> => mockUseParams(),
  };
});

jest.mock('@kubevirt-ui-ext/kubevirt-api/console', () => ({
  NodeModel: {
    abbr: 'NO',
    apiVersion: 'v1',
    kind: 'Node',
    label: 'Node',
    labelKey: 'node',
    labelPlural: 'Nodes',
    namespaced: false,
    plural: 'nodes',
  },
  VirtualMachineModelGroupVersionKind: {
    group: 'kubevirt.io',
    kind: 'VirtualMachine',
    version: 'v1',
  },
}));

jest.mock('../../../cdi-upload-provider/utils/utils', () => ({
  resourcePathFromModel: (_model: unknown, name: string): string => `/k8s/cluster/nodes/${name}`,
}));

describe('NodeInventoryItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({});
  });

  it('should show a skeleton while VMs are loading', () => {
    mockUseAccessibleResources.mockReturnValue({
      loaded: false,
      loadError: undefined,
      resources: [],
    });
    mockUseVirtualMachineInstanceMapper.mockReturnValue({
      vmiMapper: { mapper: {}, nodeNames: {} },
      vmisLoaded: false,
    });

    render(<NodeInventoryItem obj={createNode('node-1')} />);

    expect(screen.getByTestId('vm-inventory-skeleton')).toBeInTheDocument();
    expect(screen.getByText('Virtual machines')).toBeInTheDocument();
  });

  it('should not show a skeleton when there is a load error', () => {
    mockUseAccessibleResources.mockReturnValue({
      loaded: false,
      loadError: new Error('failed to load'),
      resources: [],
    });
    mockUseVirtualMachineInstanceMapper.mockReturnValue({
      vmiMapper: { mapper: {}, nodeNames: {} },
      vmisLoaded: false,
    });

    render(<NodeInventoryItem obj={createNode('node-1')} />);

    expect(screen.queryByTestId('vm-inventory-skeleton')).not.toBeInTheDocument();
  });

  it('should filter VMs to only those scheduled on the node', () => {
    mockLoadedState({
      resources: [createVM('vm-1', 'default', 'Running'), createVM('vm-2', 'default', 'Running')],
      vmiEntries: [
        { name: 'vm-1', namespace: 'default', nodeName: 'node-1' },
        { name: 'vm-2', namespace: 'default', nodeName: 'node-2' },
      ],
    });

    render(<NodeInventoryItem obj={createNode('node-1')} />);

    expect(screen.getByRole('link', { name: '1 Virtual machine' })).toBeInTheDocument();
  });

  it('should link to the node workload virtual machine tab', () => {
    mockLoadedState({
      resources: [createVM('vm-1', 'default', 'Running')],
      vmiEntries: [{ name: 'vm-1', namespace: 'default', nodeName: 'node-1' }],
    });

    render(<NodeInventoryItem obj={createNode('node-1')} />);

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/k8s/cluster/nodes/node-1/workload?activeTab=virtualmachines',
    );
  });

  it('should show VM status counts when loaded', () => {
    (getVMStatuses as jest.Mock).mockReturnValue({
      otherStatuses: {},
      otherStatusesCount: 0,
      primaryStatuses: { Error: 1, Running: 2, Stopped: 1 },
    });

    mockLoadedState({
      resources: [
        createVM('vm-running-1', 'default', 'Running'),
        createVM('vm-running-2', 'default', 'Running'),
        createVM('vm-stopped', 'default', 'Stopped'),
        createVM('vm-error', 'default', 'CrashLoopBackOff'),
      ],
      vmiEntries: [
        { name: 'vm-running-1', namespace: 'default', nodeName: 'node-1' },
        { name: 'vm-running-2', namespace: 'default', nodeName: 'node-1' },
        { name: 'vm-stopped', namespace: 'default', nodeName: 'node-1' },
        { name: 'vm-error', namespace: 'default', nodeName: 'node-1' },
      ],
    });

    render(<NodeInventoryItem obj={createNode('node-1')} />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getAllByText('1')).toHaveLength(2);
    expect(screen.getByTestId('running-icon')).toBeInTheDocument();
    expect(screen.getByTestId('stopped-icon')).toBeInTheDocument();
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });

  it('should not show status counts while VMIs are loading', () => {
    (getVMStatuses as jest.Mock).mockReturnValue({
      otherStatuses: {},
      otherStatusesCount: 0,
      primaryStatuses: { Error: 0, Running: 1, Stopped: 0 },
    });

    mockLoadedState({
      resources: [createVM('vm-1', 'default', 'Running')],
      vmiEntries: [{ name: 'vm-1', namespace: 'default', nodeName: 'node-1' }],
      vmisLoaded: false,
    });

    render(<NodeInventoryItem obj={createNode('node-1')} />);

    expect(screen.getByRole('link')).toHaveTextContent('Virtual machine');
    expect(screen.queryByTestId('running-icon')).not.toBeInTheDocument();
  });
});
