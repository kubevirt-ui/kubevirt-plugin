import * as React from 'react';

import { cleanup, render } from '@testing-library/react';

import Wizard from '../Wizard';

afterEach(cleanup);

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  HorizontalNav: () => <>HorizontalNav</>,
}));

test('TemplatesCatalog', async () => {
  render(<Wizard />);
});
