import * as React from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import { CustomizeSource } from '../components/CustomizeSource';

import { getMockTemplate } from './mocks';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ ns: 'mock-namespace' }),
}));

jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn().mockImplementation(() => ({
    register: jest.fn(),
    watch: jest.fn(),
    handleSubmit: jest.fn(),
    formState: {
      errors: {},
    },
  })),
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
        diskSource={undefined}
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
        diskSource={undefined}
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
});
