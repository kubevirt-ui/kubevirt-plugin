import * as React from 'react';

import { cleanup, render } from '@testing-library/react';

import { conditionsMock } from './mocks';
import { VMStatusConditionLabelList } from './VMStatusConditionLabel';

afterEach(cleanup);

test('Render VMStatusConditionLabelList', () => {
  const { asFragment } = render(<VMStatusConditionLabelList conditions={conditionsMock} />);
  expect(asFragment()).toMatchSnapshot();
});
