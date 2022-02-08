import * as React from 'react';

import { act, cleanup, fireEvent, queryByAttribute, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TemplatesCatalog from '../TemplatesCatalog';

import { containerTemplateMock, urlTemplateMock } from './mocks';

const getByDataTestId = queryByAttribute.bind(null, 'data-test-id');

jest.mock('@kubevirt-utils/hooks/useIsAdmin', () => ({
  useIsAdmin: () => [false, true],
}));

jest.mock('../hooks/useVmTemplates', () => ({
  useVmTemplates: () => ({ templates: [urlTemplateMock, containerTemplateMock], loaded: true }),
}));

afterEach(cleanup);

test('TemplatesCatalog', async () => {
  const { container } = render(<TemplatesCatalog />);

  // non admin user, should see all templates by default
  // default variant template, should be in catalog
  expect(getByDataTestId(container, 'container-template')).toBeInTheDocument();

  // not default variant template, should be in catalog
  expect(getByDataTestId(container, 'url-template')).toBeInTheDocument();

  // switching to default templates, url template should not be in catalog
  fireEvent.click(screen.getByText('Default Templates'));
  expect(getByDataTestId(container, 'url-template')).toBeNull();

  // picking RHEL filter, container-template should not be in catalog
  fireEvent.click(screen.getByText('RHEL'));
  expect(getByDataTestId(container, 'container-template')).toBeNull();

  // removing RHEL filter
  fireEvent.click(screen.getByText('RHEL'));
  expect(getByDataTestId(container, 'container-template')).toBeInTheDocument();

  // searching unknown query, no templates should be in catalog.
  // fake timers are used because of debounced input
  jest.useFakeTimers('modern');
  userEvent.type(screen.getByPlaceholderText('Filter by name'), 'unknown');

  act(() => {
    jest.runOnlyPendingTimers();
  });

  expect(getByDataTestId(container, 'container-template')).toBeNull();
});
