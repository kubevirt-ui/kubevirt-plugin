import * as React from 'react';

import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BOOT_SOURCE } from '../../utils/vm-template-source/utils';
import { TemplatesCatalogDrawer } from '../components/TemplatesCatalogDrawer/TemplatesCatalogDrawer';

import { containerTemplateMock } from './mocks';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../utils/vm-template-source/useVmTemplateSource', () => ({
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

test('TemplatesCatalogDrawer', async () => {
  const handleClose = jest.fn();

  const { getByText, getAllByText, getByTestId } = render(
    <TemplatesCatalogDrawer
      namespace="default"
      isOpen
      onClose={handleClose}
      template={containerTemplateMock}
    />,
  );
  expect(getAllByText(containerTemplateMock.metadata.name)).toBeTruthy();

  // test read more btn
  fireEvent.click(getByText('Read more'));

  // test doc btn
  fireEvent.click(getByText('Refer to documentation'));

  // wait for mocked useIsTemplateSupportsQuickCreate to return true and render the quick create form
  await waitFor(() => {
    expect(getByTestId('vm-name-input')).toBeInTheDocument();
  });

  // change vm name
  userEvent.clear(getByTestId('vm-name-input'));
  userEvent.type(getByTestId('vm-name-input'), 'new-vm');
  expect(getByTestId('vm-name-input')).toHaveValue('new-vm');

  // test customize vm btn
  fireEvent.click(getByTestId('customize-vm-btn'));

  // test create btn
  fireEvent.click(getByTestId('quick-create-vm-btn'));

  // test close btn
  fireEvent.click(getByText('Cancel'));
});
