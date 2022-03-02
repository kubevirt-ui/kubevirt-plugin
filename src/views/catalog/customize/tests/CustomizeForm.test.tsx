import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CustomizeForm } from '../components/CustomizeForm';

import { getMockTemplate } from './mocks';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ ns: 'mock-namespace' }),
  useHistory: () => ({ push: jest.fn() }),
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { mockUseK8sWatchResource, getMockTemplate: getTemplate } = require('./mocks');
  return {
    useK8sWatchResource: mockUseK8sWatchResource,
    k8sCreate: jest.fn().mockResolvedValue(getTemplate()),
  };
});

const fillFieldsWithText = (testInput) => {
  (screen.getAllByRole('textbox') as HTMLInputElement[]).forEach((inputText) => {
    if (!inputText.value) {
      userEvent.type(inputText, testInput);
    }
  });
};

let mockVirtualMachineTemplate = getMockTemplate();

describe('Test CustomizeForm', () => {
  afterEach(() => {
    jest.resetAllMocks();
    mockVirtualMachineTemplate = getMockTemplate();
    (k8sCreate as jest.Mock).mockReset();
    cleanup();
  });

  it('It render all the parameters', () => {
    render(<CustomizeForm template={mockVirtualMachineTemplate} />);

    expect(screen.getAllByRole('textbox')).toHaveLength(
      mockVirtualMachineTemplate.parameters.length,
    );

    expect(screen.queryByText('Storage')).not.toBeNull();
  });

  it('On submit create the vm', async () => {
    const mockTestInput = 'test-input-string';
    render(<CustomizeForm template={getMockTemplate()} />);

    fillFieldsWithText(mockTestInput);

    act(() => {
      fireEvent.click(screen.getByTestId('customize-vm-submit-button'));
    });

    await waitFor(() => expect(k8sCreate).toBeCalled());
  });

  it('Shows error message if required params are missing', async () => {
    const mockTestInput = 'test-input-string';

    render(<CustomizeForm template={getMockTemplate()} />);

    act(() => {
      fireEvent.click(screen.getByTestId('customize-vm-submit-button'));
    });

    await waitFor(() => {
      expect(k8sCreate).not.toBeCalled();
    });

    screen.getAllByTitle('Error');

    expect(
      within(screen.getByTestId('customize-vm-submit-button')).queryByRole('progressbar'),
    ).toBeNull();

    fillFieldsWithText(mockTestInput);

    act(() => {
      fireEvent.click(screen.getByTestId('customize-vm-submit-button'));
    });

    await waitFor(() => expect(k8sCreate).toBeCalled());
  });

  it('Hide optional fields', () => {
    render(<CustomizeForm template={mockVirtualMachineTemplate} />);

    const oneOptionalField = mockVirtualMachineTemplate.parameters.find(
      (parameter) => !parameter.required,
    );

    expect(screen.getByText(oneOptionalField.description)).toBeVisible();

    act(() => {
      fireEvent.click(
        within(screen.getByTestId('expandable-optional-section')).getByRole('button'),
      );
    });

    expect(screen.getByText(oneOptionalField.description)).not.toBeVisible();
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
    render(<CustomizeForm template={mockTemplate} />);

    expect(screen.queryByText('Storage')).toBeNull();

    expect(screen.getAllByRole('textbox')).toHaveLength(
      mockVirtualMachineTemplate.parameters.length,
    );

    fillFieldsWithText('testtext');

    act(() => {
      fireEvent.click(screen.getByTestId('customize-vm-submit-button'));
    });

    await waitFor(() => expect(k8sCreate).toBeCalled());
  });
});
