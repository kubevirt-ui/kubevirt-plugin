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
  useHistory: () => ({
    push: mockHistoryPush,
  }),
  useParams: jest.fn(() => ({
    ns: DEFAULT_NAMESPACE,
  })),
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const processedTemplate = require('./mocks').containerTemplateMock;
  return {
    k8sCreate: jest.fn().mockResolvedValue(processedTemplate),
    useAccessReview: jest.fn().mockReturnValue([true, false]),
    useK8sModels: jest.fn(() => [
      {
        [`${VirtualMachineModelRef}`]: VirtualMachineModel,
      },
      true,
    ]),
    useK8sWatchResource: jest.fn(() => [[], true]),
  };
});

jest.mock('@kubevirt-utils/resources/template/hooks/useVmTemplateSource', () => ({
  useVmTemplateSource: () => ({
    error: null,
    isBootSourceAvailable: true,
    loaded: true,
    templateBootSource: {
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
      type: BOOT_SOURCE.REGISTRY,
    },
  }),
}));

jest.mock('@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings', () => {
  return jest.fn().mockReturnValue([{}, jest.fn(), true, null]);
});

afterEach(cleanup);

const renderWithWizardContext = ({ children }) => (
  <WizardVMContextProvider>{children}</WizardVMContextProvider>
);

test('TemplatesCatalogDrawer', async () => {
  const handleClose = jest.fn();

  const { getAllByText, getByTestId, getByText } = render(
    <TemplatesCatalogDrawer
      isOpen
      namespace={DEFAULT_NAMESPACE}
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
