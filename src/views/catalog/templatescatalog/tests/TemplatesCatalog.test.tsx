import * as React from 'react';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TemplatesCatalog from '../TemplatesCatalog';

import { containerTemplateMock, urlTemplateMock } from './mocks';

jest.mock('@kubevirt-utils/hooks/useIsAdmin', () => ({
  useIsAdmin: () => [false, true],
}));

jest.mock('../hooks/useVmTemplates', () => ({
  useVmTemplates: () => ({ templates: [urlTemplateMock, containerTemplateMock], loaded: true }),
}));

// render template drawer without quick create
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn().mockRejectedValue({}),
}));

afterEach(cleanup);

test('TemplatesCatalog', async () => {
  const { getByTestId, queryByTestId, getByText } = render(
    <TemplatesCatalog
      history={{} as any}
      location={{} as any}
      match={{
        isExact: false,
        path: '/templatescatalog',
        url: '/templatescatalog',
        params: { ns: 'default' },
      }}
    />,
  );

  // non admin user, should see all templates by default
  // default variant template, should be in catalog
  expect(getByTestId('container-template')).toBeInTheDocument();

  // not default variant template, should be in catalog
  expect(getByTestId('url-template')).toBeInTheDocument();

  // switching to default templates, url template should not be in catalog
  fireEvent.click(getByText('Default Templates'));
  expect(queryByTestId('url-template')).toBeNull();

  // picking RHEL filter, container-template should not be in catalog
  fireEvent.click(getByText('RHEL'));
  expect(queryByTestId('container-template')).toBeNull();

  // removing RHEL filter
  fireEvent.click(getByText('RHEL'));
  expect(getByTestId('container-template')).toBeInTheDocument();

  // searching unknown query, no templates should be in catalog.
  // fake timers are used because of debounced input
  jest.useFakeTimers('modern');
  userEvent.type(screen.getByPlaceholderText('Filter by name'), 'unknown');

  act(() => {
    jest.runOnlyPendingTimers();
  });

  expect(queryByTestId('container-template')).toBeNull();

  // clear all filters, all templates should be in catalog
  fireEvent.click(getByText('Clear All Filters'));
  expect(getByTestId('container-template')).toBeInTheDocument();
});
