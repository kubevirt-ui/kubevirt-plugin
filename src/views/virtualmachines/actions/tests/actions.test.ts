import { VirtualMachineInstanceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { VMActionRequest, VMActionType } from '../actions';

import { exampleRunningVirtualMachine } from './mocks';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  consoleFetch: jest
    .fn()
    // first time we want to mock an Error response
    .mockRejectedValueOnce(new Error('error'))
    .mockResolvedValue({
      text: () => 'success',
    }),
}));

describe('actions.ts tests', () => {
  test('test VMActionRequest start action', async () => {
    const action = VMActionType.Start;

    // This should be rejected by the mock
    const failedResponse = VMActionRequest({
      action,
      model: VirtualMachineModel,
      vm: exampleRunningVirtualMachine,
    });
    kubevirtConsole.log(failedResponse);

    // Test to check a VMActionRequest works with 'start' action
    const response = VMActionRequest({
      action,
      model: VirtualMachineModel,
      vm: exampleRunningVirtualMachine,
    });
    expect(response).resolves.toBe('success');
  });

  test('test VMActionRequest stop action', async () => {
    const action = VMActionType.Stop;
    // Test to check a VMActionRequest works with 'stop' action
    const response = VMActionRequest({
      action,
      model: VirtualMachineModel,
      vm: exampleRunningVirtualMachine,
    });
    expect(response).resolves.toBe('success');
  });

  test('test VMActionRequest restart action', async () => {
    const action = VMActionType.Restart;
    // Test to check a VMActionRequest works with 'restart' action
    const response = VMActionRequest({
      action,
      model: VirtualMachineModel,
      vm: exampleRunningVirtualMachine,
    });
    expect(response).resolves.toBe('success');
  });

  test('test VMActionRequest pause action', async () => {
    const action = VMActionType.Pause;
    // Test to check a VMActionRequest works with 'pause' action
    const response = VMActionRequest({
      action,
      model: VirtualMachineInstanceModel,
      vm: exampleRunningVirtualMachine,
    });
    expect(response).resolves.toBe('success');
  });

  test('test VMActionRequest unpause action', async () => {
    const action = VMActionType.Unpause;
    // Test to check a VMActionRequest works with 'unpause' action
    const response = VMActionRequest({
      action,
      model: VirtualMachineInstanceModel,
      vm: exampleRunningVirtualMachine,
    });
    expect(response).resolves.toBe('success');
  });
});
