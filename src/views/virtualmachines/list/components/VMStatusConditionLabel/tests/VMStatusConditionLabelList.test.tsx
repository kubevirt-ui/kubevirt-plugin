import * as React from 'react';

import { cleanup, render } from '@testing-library/react';

import { VMStatusConditionLabelList } from '../VMStatusConditionLabel';

import { conditionsMock } from './mocks';

afterEach(cleanup);

test('Render VMStatusConditionLabelList', () => {
  const { asFragment } = render(<VMStatusConditionLabelList conditions={conditionsMock} />);
  expect(asFragment()).toMatchSnapshot();
});
