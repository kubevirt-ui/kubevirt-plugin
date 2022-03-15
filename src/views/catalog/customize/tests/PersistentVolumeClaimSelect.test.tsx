import * as React from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import { PersistentVolumeClaimSelect } from '../components/PersistentVolumeClaimSelect';

import { getPVCs } from './mocks';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { mockUseK8sWatchResource } = require('./mocks');
  return {
    useK8sWatchResource: mockUseK8sWatchResource,
  };
});

const onNamespaceSelected = jest.fn();
const onNameSelected = jest.fn();

describe('PersistentVolumeClaimSelect tests', () => {
  afterEach(() => {
    onNameSelected.mockReset();
    onNamespaceSelected.mockReset();
    cleanup();
  });

  it('Select namespace and name', async () => {
    const pvc = getPVCs()[0];
    const namespace = pvc.metadata.namespace;
    const { rerender } = render(
      <PersistentVolumeClaimSelect
        pvcNameSelected={undefined}
        projectSelected={undefined}
        selectPVCName={onNameSelected}
        selectNamespace={onNamespaceSelected}
      />,
    );

    expect(screen.getByLabelText('Persistent Volume Claim name', { exact: false })).toBeDisabled();

    act(() => {
      fireEvent.click(screen.getByLabelText('Persistent Volume Claim project', { exact: false }));
    });

    act(() => {
      fireEvent.click(screen.getByText(namespace));
    });

    expect(onNamespaceSelected).toBeCalledWith(namespace);

    rerender(
      <PersistentVolumeClaimSelect
        pvcNameSelected={undefined}
        projectSelected={namespace}
        selectPVCName={onNameSelected}
        selectNamespace={onNamespaceSelected}
      />,
    );

    expect(
      screen.getByLabelText('Persistent Volume Claim name', { exact: false }),
    ).not.toBeDisabled();

    act(() => {
      fireEvent.click(screen.getByLabelText('Persistent Volume Claim name', { exact: false }));
    });

    act(() => {
      fireEvent.click(screen.getByText(pvc.metadata.name));
    });

    expect(onNameSelected).toBeCalledWith(pvc.metadata.name);
  });
});
