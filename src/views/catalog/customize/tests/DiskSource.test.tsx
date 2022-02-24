import * as React from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  DEFAULT_DISK_SOURCE,
  DiskSource,
  HTTP_DISK_SOURCE_NAME,
  PVC_SIZE_FORMATS,
  REGISTRY_DISK_SOURCE_NAME,
} from '../components/DiskSource';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { mockUseK8sWatchResource } = require('./mocks');
  return {
    useK8sWatchResource: mockUseK8sWatchResource,
  };
});

const onChangeMock = jest.fn();

describe('Test DiskSource', () => {
  afterEach(() => {
    onChangeMock.mockReset();
    cleanup();
  });

  it('Select HTTP disk source', () => {
    const testImageUrl = 'imageUrl';
    render(<DiskSource onChange={onChangeMock} />);

    act(() => {
      fireEvent.click(screen.getByTestId(DEFAULT_DISK_SOURCE));
    });

    act(() => {
      fireEvent.click(screen.getByTestId(HTTP_DISK_SOURCE_NAME));
    });

    userEvent.type(screen.getByLabelText('Image URL'), testImageUrl);

    expect(onChangeMock).lastCalledWith({
      storage: '30Gi',
      source: {
        http: {
          url: testImageUrl,
        },
      },
    });
  });

  it('Select Container disk source and change volume', () => {
    const testContainer = 'containerurl';
    render(<DiskSource onChange={onChangeMock} />);

    act(() => {
      fireEvent.click(screen.getByTestId(DEFAULT_DISK_SOURCE));
    });

    act(() => {
      fireEvent.click(screen.getByTestId(REGISTRY_DISK_SOURCE_NAME));
    });

    userEvent.type(screen.getByLabelText('Container Image'), testContainer);

    expect(onChangeMock).lastCalledWith({
      storage: '30Gi',
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
      storage: '29Gi',
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
      storage: '30Gi',
      source: {
        registry: {
          url: testContainer,
        },
      },
    });

    const mockedVolumeValue = '23';
    userEvent.type(screen.getByDisplayValue('30'), `{selectall}${mockedVolumeValue}`);

    expect(onChangeMock).lastCalledWith({
      storage: mockedVolumeValue + 'Gi',
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
      storage: mockedVolumeValue + 'Mi',
      source: {
        registry: {
          url: testContainer,
        },
      },
    });
  });
});
