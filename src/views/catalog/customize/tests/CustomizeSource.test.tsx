import * as React from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  CustomizeSource,
  DEFAULT_SOURCE,
  HTTP_SOURCE_NAME,
  REGISTRY_SOURCE_NAME,
} from '../components/CustomizeSource';

import { getMockTemplate } from './mocks';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ ns: 'mock-namespace' }),
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { mockUseK8sWatchResource } = require('./mocks');
  return {
    useK8sWatchResource: mockUseK8sWatchResource,
  };
});

const template = getMockTemplate();
const onChangeMock = jest.fn();
const setDrivers = jest.fn();
const setCDSource = jest.fn();

describe('Test CustomizeSource', () => {
  afterEach(() => {
    onChangeMock.mockReset();
    cleanup();
  });

  it('Switch to cd Source with checkbox', () => {
    const { rerender } = render(
      <CustomizeSource
        template={template}
        setDiskSource={onChangeMock}
        setDrivers={setDrivers}
        withDrivers={false}
        setCDSource={setCDSource}
        cdSource={undefined}
      />,
    );

    screen.getByText('Disk source');

    act(() => {
      fireEvent.click(screen.getByLabelText('Boot from CD', { exact: false }));
    });

    expect(setCDSource).toBeCalled();

    const newCdSource = (setCDSource as jest.Mock).mock.calls[0][0];
    rerender(
      <CustomizeSource
        template={template}
        setDiskSource={onChangeMock}
        setDrivers={setDrivers}
        withDrivers={false}
        setCDSource={setCDSource}
        cdSource={newCdSource}
      />,
    );

    screen.getByText('CD source');
  });

  it('Select HTTP source', () => {
    const testImageUrl = 'imageUrl';
    render(
      <CustomizeSource
        template={template}
        setDiskSource={onChangeMock}
        setDrivers={setDrivers}
        withDrivers={false}
        setCDSource={setCDSource}
        cdSource={undefined}
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
      storage: {
        resources: {
          requests: {
            storage:
              template.objects[0].spec.dataVolumeTemplates[0].spec.storage.resources.requests
                .storage,
          },
        },
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
        template={template}
        setDiskSource={onChangeMock}
        setDrivers={setDrivers}
        withDrivers={false}
        setCDSource={setCDSource}
        cdSource={undefined}
      />,
    );
    const templateStorage =
      template.objects[0].spec.dataVolumeTemplates[0].spec.storage.resources.requests.storage;

    act(() => {
      fireEvent.click(screen.getByTestId(DEFAULT_SOURCE));
    });

    act(() => {
      fireEvent.click(screen.getByTestId(REGISTRY_SOURCE_NAME));
    });

    userEvent.type(screen.getByLabelText('Container Image'), testContainer);

    expect(onChangeMock).lastCalledWith({
      storage: {
        resources: {
          requests: {
            storage: templateStorage,
          },
        },
      },
      source: {
        registry: {
          url: 'docker://'.concat(testContainer),
        },
      },
    });

    const mockedVolumeValue = '23';
    userEvent.type(
      screen.getByDisplayValue(parseInt(templateStorage)),
      `{selectall}${mockedVolumeValue}`,
    );

    expect(onChangeMock).lastCalledWith({
      storage: {
        resources: { requests: { storage: mockedVolumeValue + 'Gi' } },
      },
      source: {
        registry: {
          url: 'docker://'.concat(testContainer),
        },
      },
    });
  });
});
