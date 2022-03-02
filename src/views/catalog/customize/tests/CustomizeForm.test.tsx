import * as React from 'react';

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
  const { getMockTemplate: getTemplate } = require('./mocks');
  return {
    k8sCreate: jest.fn().mockResolvedValue(getTemplate()),
  };
});

const mockVirtualMachineTemplate = getMockTemplate();

describe('Test CustomizeForm', () => {
  beforeEach(() => {
    (k8sCreate as jest.Mock).mockReset();
    cleanup();
  });

  it('It render all the parameters', () => {
    render(<CustomizeForm template={mockVirtualMachineTemplate} />);

    const nParameters = mockVirtualMachineTemplate.parameters.length;

    expect(screen.getAllByRole('textbox')).toHaveLength(nParameters);
  });

  it('On submit create the vm', async () => {
    const mockTestInput = 'test-input-string';
    render(<CustomizeForm template={getMockTemplate()} />);

    (screen.getAllByRole('textbox') as HTMLInputElement[]).forEach((inputText) => {
      if (!inputText.value) {
        act(() => userEvent.type(inputText, mockTestInput));
      }
    });

    act(() => {
      fireEvent.click(screen.getByTestId('customize-vm-submit-button'));
    });

    await waitFor(() => expect(k8sCreate).toBeCalled());
  });

  it('Shows error message if required params are missing', async () => {
    render(<CustomizeForm template={mockVirtualMachineTemplate} />);

    act(() => {
      fireEvent.click(screen.getByTestId('customize-vm-submit-button'));
    });

    expect(k8sCreate).not.toBeCalled();
    screen.getAllByTitle('Error');

    expect(
      within(screen.getByTestId('customize-vm-submit-button')).queryByRole('progressbar'),
    ).toBeNull();

    (screen.getAllByRole('textbox') as HTMLInputElement[]).forEach((inputText) => {
      const mockTestInput = 'test-input-string';
      if (!inputText.value) {
        act(() => userEvent.type(inputText, mockTestInput));
      }
    });

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
      fireEvent.click(within(screen.getByTestId('expandable-section')).getByRole('button'));
    });

    expect(screen.getByText(oneOptionalField.description)).not.toBeVisible();
  });
});
