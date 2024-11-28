import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import useVirtualMachineActionsProvider from '../hooks/useVirtualMachineActionsProvider';

import { exampleRunningVirtualMachine } from './mocks';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useK8sModel: jest.fn(() => [[], true]),
  useK8sWatchResource: jest.fn(() => [[], true]),
}));
afterEach(cleanup);

describe('useVirtualMachineActionsProvider tests', () => {
  it('Test running VM actions', () => {
    const { result } = renderHook(() =>
      useVirtualMachineActionsProvider(exampleRunningVirtualMachine),
    );
    // expect(result.current).toMatchSnapshot();

    const [actions] = result.current;
    const runningVMActions = actions.map((action) => action.id);

    // Running vm should have stop, restart, pause, migrate and delete actions
    expect(runningVMActions).toEqual([
      'vm-action-stop',
      'vm-action-restart',
      'vm-action-pause',
      'vm-action-clone',
      'vm-action-snapshot',
      'migration-menu',
      'vm-action-copy-ssh',
      'vm-action-move-to-folder',
      'vm-action-delete',
    ]);
  });

  it('Test stopped VM actions', () => {
    const stoppedVM: V1VirtualMachine = {
      ...exampleRunningVirtualMachine,
      status: { printableStatus: 'Stopped' },
    };
    const { result } = renderHook(() => useVirtualMachineActionsProvider(stoppedVM));

    const [actions] = result.current;
    const stoppedVMActions = actions.map((action) => action.id);

    // Stopped vm should have start, restart, pause, migrate and delete actions
    expect(stoppedVMActions).toEqual([
      'vm-action-start',
      'vm-action-restart',
      'vm-action-pause',
      'vm-action-clone',
      'vm-action-snapshot',
      'migration-menu',
      'vm-action-copy-ssh',
      'vm-action-move-to-folder',
      'vm-action-delete',
    ]);
  });

  it('Test paused VM actions', () => {
    const pausedVM: V1VirtualMachine = {
      ...exampleRunningVirtualMachine,
      status: { printableStatus: 'Paused' },
    };
    const { result } = renderHook(() => useVirtualMachineActionsProvider(pausedVM));

    const [actions] = result.current;
    const pausedVMActions = actions.map((action) => action.id);

    // Paused vm should have stop, restart, unpause, migrate and delete actions
    expect(pausedVMActions).toEqual([
      'vm-action-stop',
      'vm-action-restart',
      'vm-action-unpause',
      'vm-action-clone',
      'vm-action-snapshot',
      'migration-menu',
      'vm-action-copy-ssh',
      'vm-action-move-to-folder',
      'vm-action-delete',
    ]);
  });

  it('Test migrating VM actions', () => {
    const migratingVM: V1VirtualMachine = {
      ...exampleRunningVirtualMachine,
      status: { printableStatus: 'Migrating' },
    };
    const { result } = renderHook(() => useVirtualMachineActionsProvider(migratingVM));

    const [actions] = result.current;
    const migratingVMActions = actions.map((action) => action.id);

    const migratingSubmenu = actions.find((action) => action.id === 'migration-menu');
    const migratingSubmenuIds = migratingSubmenu.options.map((action) => action.id);

    // Migrating vm should have stop, restart, pause, migrate and delete actions
    expect(migratingVMActions).toEqual([
      'vm-action-stop',
      'vm-action-restart',
      'vm-action-pause',
      'vm-action-clone',
      'vm-action-snapshot',
      'migration-menu',
      'vm-action-copy-ssh',
      'vm-action-move-to-folder',
      'vm-action-delete',
    ]);

    expect(migratingSubmenuIds).toEqual(['vm-action-cancel-migrate', 'vm-migrate-storage']);
  });
});
