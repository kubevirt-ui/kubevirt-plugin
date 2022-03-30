import * as React from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SelectCDSourceLabel } from '../components/CustomizeForms/SelectCDSourceLabel';
import { SelectDiskSourceLabel } from '../components/CustomizeForms/SelectDiskSourceLabel';
import {
  CustomizeSource,
  DEFAULT_SOURCE,
  HTTP_SOURCE_NAME,
  PVC_SIZE_FORMATS,
  REGISTRY_SOURCE_NAME,
} from '../components/CustomizeSource';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { mockUseK8sWatchResource } = require('./mocks');
  return {
    useK8sWatchResource: mockUseK8sWatchResource,
  };
});

const onChangeMock = jest.fn();
const setDrivers = jest.fn();

describe('Test CustomizeSource', () => {
  afterEach(() => {
    onChangeMock.mockReset();
    cleanup();
  });

  it('Select HTTP source', () => {
    const testImageUrl = 'imageUrl';
    render(
      <CustomizeSource
        onChange={onChangeMock}
        sourceLabel={<SelectDiskSourceLabel />}
        setDrivers={setDrivers}
        withDrivers={false}
      />,
    );

    act(() => {
      fireEvent.click(screen.getByTestId(DEFAULT_SOURCE));
    });

    act(() => {
      fireEvent.click(screen.getByTestId(HTTP_SOURCE_NAME));
    });

    userEvent.type(screen.getByLabelText('Image URL'), testImageUrl);

    expect(onChangeMock).lastCalledWith({
      pvc: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '30Gi' } },
      },
      source: {
        http: {
          url: testImageUrl,
        },
      },
    });
  });

  it('Select Container source and change volume', () => {
    const testContainer = 'containerurl';
    render(
      <CustomizeSource
        onChange={onChangeMock}
        sourceLabel={<SelectCDSourceLabel />}
        setDrivers={setDrivers}
        withDrivers={false}
      />,
    );

    act(() => {
      fireEvent.click(screen.getByTestId(DEFAULT_SOURCE));
    });

    act(() => {
      fireEvent.click(screen.getByTestId(REGISTRY_SOURCE_NAME));
    });

    userEvent.type(screen.getByLabelText('Container Image'), testContainer);

    expect(onChangeMock).lastCalledWith({
      pvc: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '30Gi' } },
      },
      source: {
        registry: {
          url: testContainer,
        },
      },
    });

    act(() => {
      fireEvent.click(screen.getByLabelText('Decrement'));
    });

    expect(onChangeMock).lastCalledWith({
      pvc: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '29Gi' } },
      },
      source: {
        registry: {
          url: testContainer,
        },
      },
    });

    act(() => {
      fireEvent.click(screen.getByLabelText('Increment'));
    });

    expect(onChangeMock).lastCalledWith({
      pvc: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: '30Gi' } },
      },
      source: {
        registry: {
          url: testContainer,
        },
      },
    });

    const mockedVolumeValue = '23';
    userEvent.type(screen.getByDisplayValue('30'), `{selectall}${mockedVolumeValue}`);

    expect(onChangeMock).lastCalledWith({
      pvc: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: mockedVolumeValue + 'Gi' } },
      },
      source: {
        registry: {
          url: testContainer,
        },
      },
    });

    act(() => {
      userEvent.click(screen.getByText(PVC_SIZE_FORMATS.GiB));
    });

    act(() => {
      userEvent.click(screen.getByText(PVC_SIZE_FORMATS.MiB));
    });

    expect(onChangeMock).lastCalledWith({
      pvc: {
        accessModes: ['ReadWriteOnce'],
        resources: { requests: { storage: mockedVolumeValue + 'Mi' } },
      },
      source: {
        registry: {
          url: testContainer,
        },
      },
    });
  });
});
