import * as React from 'react';

import { BOOT_SOURCE } from '@kubevirt-utils/resources/template/utils/constants';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TemplatesCatalog from '../TemplatesCatalog';

import { containerTemplateMock, urlTemplateMock } from './mocks';

jest.mock('../hooks/useTemplatesWithAvailableSource', () => ({
  useTemplatesWithAvailableSource: () => ({
    templates: [urlTemplateMock, containerTemplateMock],
    availableTemplatesUID: new Set(['url-template-uid', 'container-template-uid']),
    availableDatasources: {},
    loaded: true,
    bootSourcesLoaded: true,
  }),
}));

// render template drawer without quick create
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  k8sCreate: jest.fn().mockRejectedValue({}),
  useK8sWatchResource: jest.fn().mockReturnValue([[], true, undefined]),
  useAccessReview: jest.fn().mockReturnValue([true, false]),
}));

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

  // non admin user, should see default templates by default
  // default variant template, should be in catalog
  expect(getByTestId('container-template')).toBeInTheDocument();

  // not default variant template, should be in catalog
  fireEvent.click(getByText('All Items'));
  expect(getByTestId('url-template')).toBeInTheDocument();

  // switching to default templates, url template should still be in catalog as custom template
  fireEvent.click(getByText('Default Templates'));
  expect(queryByTestId('url-template')).toBeInTheDocument();

  // picking RHEL filter, container-template should not be in catalog
  fireEvent.click(getByText('RHEL'));
  expect(queryByTestId('container-template')).toBeNull();

  // removing RHEL filter
  fireEvent.click(getByText('RHEL'));
  expect(getByTestId('container-template')).toBeInTheDocument();

  // searching unknown query, no templates should be in catalog.
  // fake timers are used because of debounced input
  jest.useFakeTimers('modern');
  userEvent.type(screen.getByPlaceholderText('Filter by keyword...'), 'unknown');

  act(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  expect(queryByTestId('container-template')).toBeNull();

  // clear all filters, all templates should be in catalog
  fireEvent.click(getByText('Clear All Filters'));
  expect(getByTestId('container-template')).toBeInTheDocument();
});
