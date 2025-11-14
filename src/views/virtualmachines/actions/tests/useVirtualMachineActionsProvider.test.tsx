import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import useVirtualMachineActionsProvider from '../hooks/useVirtualMachineActionsProvider';

import { exampleRunningVirtualMachine } from './mocks';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(() => ({})),
  k8sPatch: jest.fn(() => ({})),
  useFlag: jest.fn(() => true),
  useK8sModel: jest.fn(() => [[], true]),
  useK8sWatchResource: jest.fn(() => [[], true]),
  useResolvedExtensions: jest.fn(() => [[], true, undefined]),
}));

jest.mock('@kubevirt-utils/hooks/useFeatures/useFeatures', () => ({
  useFeatures: jest.fn(() => ({ featureEnabled: true })),
}));
afterEach(cleanup);

const testTopLevelActions = (actions: Action[]) => {
  const topLevelVMActions = actions.map((action) => action.id);

  // top level action independent from the VM state
  // note that they do depend on feature flags
  expect(topLevelVMActions).toEqual([
    'control-menu',
    'vm-action-open-console',
    'vm-action-clone',
    'vm-action-snapshot',
    'migration-menu',
    'vm-action-copy-ssh',
    'vm-action-move-to-folder',
    'vm-action-edit-labels',
    'vm-action-delete',
  ]);
};

describe('useVirtualMachineActionsProvider tests', () => {
  it('Test running VM actions', () => {
    const { result } = renderHook(() =>
      useVirtualMachineActionsProvider(exampleRunningVirtualMachine),
    );

    const [actions] = result.current;

    testTopLevelActions(actions);

    const levelTwoActions = actions
      .flatMap((action) => action.options ?? [])
      .map((action) => action.id);
    expect(levelTwoActions).toEqual(
      expect.arrayContaining([
        'vm-action-stop',
        'vm-action-restart',
        'vm-action-pause',
        'vm-action-reset',
      ]),
    );
  });

  it('Test stopped VM actions', () => {
    const stoppedVM: V1VirtualMachine = {
      ...exampleRunningVirtualMachine,
      status: { printableStatus: 'Stopped' },
    };
    const { result } = renderHook(() => useVirtualMachineActionsProvider(stoppedVM));

    const [actions] = result.current;
    testTopLevelActions(actions);

    const levelTwoActions = actions
      .flatMap((action) => action.options ?? [])
      .map((action) => action.id);

    expect(levelTwoActions).toEqual(
      expect.arrayContaining([
        'vm-action-start',
        'vm-action-restart',
        'vm-action-pause',
        'vm-action-reset',
      ]),
    );
  });

  it('Test paused VM actions', () => {
    const pausedVM: V1VirtualMachine = {
      ...exampleRunningVirtualMachine,
      status: { printableStatus: 'Paused' },
    };
    const { result } = renderHook(() => useVirtualMachineActionsProvider(pausedVM));

    const [actions] = result.current;
    testTopLevelActions(actions);

    const levelTwoActions = actions
      .flatMap((action) => action.options ?? [])
      .map((action) => action.id);

    expect(levelTwoActions).toEqual(
      expect.arrayContaining([
        'vm-action-stop',
        'vm-action-restart',
        'vm-action-unpause',
        'vm-action-reset',
      ]),
    );
  });

  it('Test migrating VM actions', () => {
    const migratingVM: V1VirtualMachine = {
      ...exampleRunningVirtualMachine,
      status: { printableStatus: 'Migrating' },
    };
    const { result } = renderHook(() => useVirtualMachineActionsProvider(migratingVM));

    const [actions] = result.current;

    const migratingSubmenu = actions.find((action) => action.id === 'migration-menu');
    const migratingSubmenuIds = migratingSubmenu.options.map((action) => action.id);

    testTopLevelActions(actions);

    expect(migratingSubmenuIds).toEqual(['vm-action-cancel-migrate']);
  });
});
