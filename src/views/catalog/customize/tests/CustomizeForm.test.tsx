import * as React from 'react';

import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';

import { CustomizeForm } from '../components/CustomizeForms/CustomizeForm';

import { getMockTemplate } from './mocks';

jest.mock('react-router-dom', () => ({
  useParams: () => ({ ns: 'mock-namespace' }),
  useHistory: () => ({ push: jest.fn() }),
}));

jest.mock('react-hook-form', () => ({
  FormProvider: ({ children }) => children,
  useForm: jest.fn().mockImplementation(() => ({
    handleSubmit: jest.fn(),
  })),
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { mockUseK8sWatchResource, getMockTemplate: getTemplate } = require('./mocks');
  return {
    useK8sWatchResource: mockUseK8sWatchResource,
    k8sCreate: jest.fn().mockResolvedValue(getTemplate()),
  };
});

jest.mock('../../utils/WizardVMContext', () => ({
  useWizardVMContext: jest
    .fn()
    .mockImplementation(() => ({ updateVM: jest.fn(), loaded: true, error: undefined })),
}));

jest.mock('@kubevirt-utils/hooks/useCDIUpload/useCDIUpload', () => ({
  useCDIUpload: () => ({
    upload: {},
    uploadData: jest.fn().mockResolvedValue({}),
  }),
}));

let mockVirtualMachineTemplate = getMockTemplate();

describe('Test CustomizeForm', () => {
  afterEach(() => {
    mockVirtualMachineTemplate = getMockTemplate();
    (k8sCreate as jest.Mock).mockReset();
    cleanup();
  });

  it('It render all the parameters', () => {
    render(<CustomizeForm template={mockVirtualMachineTemplate} />);

    act(() => {
      fireEvent.click(
        within(screen.getByTestId('expandable-optional-section')).getByRole('button'),
      );
    });

    expect(screen.getAllByRole('textbox')).toHaveLength(
      mockVirtualMachineTemplate.parameters.length,
    );

    expect(screen.queryByText('Storage')).toBeNull();
  });

  it('Hide optional fields', () => {
    render(<CustomizeForm template={mockVirtualMachineTemplate} />);

    const oneOptionalField = mockVirtualMachineTemplate.parameters.find(
      (parameter) => !parameter.required,
    );

    expect(screen.getByText(oneOptionalField.description)).not.toBeVisible();

    act(() => {
      fireEvent.click(
        within(screen.getByTestId('expandable-optional-section')).getByRole('button'),
      );
    });

    expect(screen.getByText(oneOptionalField.description)).toBeVisible();
  });
});
