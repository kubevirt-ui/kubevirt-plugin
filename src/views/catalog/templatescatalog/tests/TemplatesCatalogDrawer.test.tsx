import * as React from 'react';

import { cleanup, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TemplatesCatalogDrawer } from '../components/TemplatesCatalogDrawer/TemplatesCatalogDrawer';

import { containerTemplateMock } from './mocks';

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
