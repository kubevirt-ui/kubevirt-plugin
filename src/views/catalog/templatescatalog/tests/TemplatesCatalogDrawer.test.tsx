import * as React from 'react';

import { WizardVMContextProvider } from '@catalog/utils/WizardVMContext';
import VirtualMachineModel, {
  VirtualMachineModelRef,
} from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { BOOT_SOURCE } from '@kubevirt-utils/resources/template';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TemplatesCatalogDrawer } from '../components/TemplatesCatalogDrawer/TemplatesCatalogDrawer';

import { containerTemplateMock } from './mocks';

const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => ({
    ns: DEFAULT_NAMESPACE,
  })),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const processedTemplate = require('./mocks').containerTemplateMock;
  return {
    k8sCreate: jest.fn().mockResolvedValue(processedTemplate),
    useK8sWatchResource: jest.fn(() => [[], true]),
    useK8sModels: jest.fn(() => [
      {
        [`${VirtualMachineModelRef}`]: VirtualMachineModel,
      },
      true,
    ]),
    useAccessReview: jest.fn().mockReturnValue([true, false]),
  };
});

jest.mock('@kubevirt-utils/resources/template/hooks/useVmTemplateSource', () => ({
  useVmTemplateSource: () => ({
    isBootSourceAvailable: true,
    loaded: true,
    error: null,
    templateBootSource: {
      type: BOOT_SOURCE.REGISTRY,
      source: {
        registry: {
          url: 'node:16',
        },
      },
      sourceValue: {
        registry: {
          url: 'node:16',
        },
      },
    },
  }),
}));

afterEach(cleanup);

const renderWithWizardContext = ({ children }) => (
  <WizardVMContextProvider>{children}</WizardVMContextProvider>
);

test('TemplatesCatalogDrawer', async () => {
  const handleClose = jest.fn();

  const { getByText, getAllByText, getByTestId } = render(
    <TemplatesCatalogDrawer
      namespace={DEFAULT_NAMESPACE}
      isOpen
      onClose={handleClose}
      template={containerTemplateMock}
    />,
    { wrapper: renderWithWizardContext },
  );
  expect(getAllByText(containerTemplateMock.metadata.name)).toBeTruthy();

  // test read more btn
  act(() => {
    fireEvent.click(getByText('Read more'));
  });

  // test doc btn
  act(() => {
    fireEvent.click(getByText('Refer to documentation'));
  });

  // wait for mocked useIsTemplateSupportsQuickCreate to return true and render the quick create form
  await waitFor(() => {
    expect(getByTestId('template-catalog-vm-name-input')).toBeInTheDocument();
  });

  // change vm name
  userEvent.clear(getByTestId('template-catalog-vm-name-input'));
  userEvent.type(getByTestId('template-catalog-vm-name-input'), 'new-vm');
  expect(getByTestId('template-catalog-vm-name-input')).toHaveValue('new-vm');

  // test customize vm btn
  act(() => {
    fireEvent.click(getByTestId('customize-vm-btn'));
  });

  await waitFor(() => {
    expect(mockHistoryPush).toBeCalled();
  });

  // test create btn
  act(() => {
    fireEvent.click(getByTestId('quick-create-vm-btn'));
  });

  // test close btn
  act(() => {
    fireEvent.click(getByText('Cancel'));
  });
});
