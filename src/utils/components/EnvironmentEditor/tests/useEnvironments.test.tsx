import { getDisks } from '@kubevirt-utils/resources/vm';
import { act, cleanup } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { EnvironmentKind } from '../constants';
import useEnvironments from '../hooks/useEnvironments';

import { exampleVirtualMachineWithEnvironments } from './mocks';

afterEach(cleanup);

const onUpdateVM = jest.fn();

const environmentNameTest = 'test';

beforeEach(() => {
  jest.resetAllMocks();
});

describe('useEnvironments tests', () => {
  it('Test save callback', () => {
    const { result } = renderHook(() =>
      useEnvironments(exampleVirtualMachineWithEnvironments, onUpdateVM),
    );

    act(() => {
      result.current.onEnvironmentAdd();
    });

    const addedEnvironment = result.current.environments.at(-1);

    expect(addedEnvironment.name).toBeUndefined();
    expect(addedEnvironment.kind).toBeUndefined();

    act(() => {
      result.current.onEnvironmentChange(
        result.current.environments.length - 1,
        environmentNameTest,
        addedEnvironment.serial,
        EnvironmentKind.secret,
      );
    });

    expect(result.current.environments.at(-1)).toStrictEqual({
      name: environmentNameTest,
      kind: EnvironmentKind.secret,
      serial: addedEnvironment.serial,
    });

    act(() => {
      result.current.onSave();
    });

    const updatedVM = onUpdateVM.mock.calls[0][0];
    const serialDisks = getDisks(updatedVM)
      ?.filter((disk) => disk.serial)
      .map((d) => d.serial);

    expect(serialDisks).toStrictEqual(result.current.environments.map((e) => e.serial));
  });
});
