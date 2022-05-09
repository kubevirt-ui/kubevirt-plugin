import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import CustomizeVirtualMachine from '../CustomizeVirtualMachine';

import { getMockTemplate } from './mocks';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ ns: 'mock-namespace' }),
  useHistory: () => ({ push: jest.fn() }),
}));

jest.mock('@kubevirt-utils/hooks/useURLParams', () => ({
  useURLParams: () => ({
    params: {
      namespace: 'mock-namespace',
      name: 'mock-name',
      get: function (parameter) {
        return this[parameter];
      },
    },
  }),
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { mockUseK8sWatchResource } = require('./mocks');
  return {
    useK8sWatchResource: mockUseK8sWatchResource,
  };
});

const mockVirtualMachineTemplate = getMockTemplate();

describe('Test CustomizeVirtualMachine', () => {
  beforeEach(() => {
    (useK8sWatchResource as jest.Mock).mockReset();
    cleanup();
  });

  it('It render the form on Template loaded', () => {
    (useK8sWatchResource as jest.Mock).mockReturnValueOnce([
      mockVirtualMachineTemplate,
      true,
      undefined,
    ]);
    render(<CustomizeVirtualMachine />);

    expect(screen.getByLabelText('Name', { exact: false }));

    expect(
      screen.getByText(
        mockVirtualMachineTemplate.metadata.annotations['openshift.io/display-name'],
      ),
    );
  });

  it('It render the loading properly on loading', () => {
    (useK8sWatchResource as jest.Mock).mockReturnValue([undefined, false, undefined]);
    render(<CustomizeVirtualMachine />);

    screen.getByTestId('skeleton');
  });

  it('It render the error properly on loading error', () => {
    (useK8sWatchResource as jest.Mock).mockReturnValue([
      undefined,
      true,
      new Error('some strange error'),
    ]);

    render(<CustomizeVirtualMachine />);
    expect(screen.queryByTestId('scheleton')).toBeNull();
    screen.getByTestId('error-message');
  });

  it('without disk source customization', async () => {
    const virtualMachine = mockVirtualMachineTemplate.objects[0];
    const mockTemplate: V1Template = {
      ...mockVirtualMachineTemplate,
      objects: [
        {
          ...virtualMachine,
          spec: {
            ...virtualMachine.spec,
            dataVolumeTemplates: [],
          },
        },
      ],
    };

    (useK8sWatchResource as jest.Mock).mockReturnValueOnce([mockTemplate, true, undefined]);

    render(<CustomizeVirtualMachine />);

    expect(screen.queryByText('Storage')).toBeNull();

    act(() => {
      fireEvent.click(
        within(screen.getByTestId('expandable-optional-section')).getByRole('button'),
      );
    });

    expect(screen.getAllByRole('textbox')).toHaveLength(
      mockVirtualMachineTemplate.parameters.length,
    );
  });

  it('with disk source customization', async () => {
    (useK8sWatchResource as jest.Mock).mockReturnValueOnce([
      mockVirtualMachineTemplate,
      true,
      undefined,
    ]);

    render(<CustomizeVirtualMachine />);

    expect(screen.queryByText('Storage')).not.toBeNull();

    act(() => {
      fireEvent.click(
        within(screen.getByTestId('expandable-optional-section')).getByRole('button'),
      );
    });

    expect(screen.getAllByRole('textbox')).toHaveLength(
      mockVirtualMachineTemplate.parameters.length,
    );
  });
});
