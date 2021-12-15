import * as React from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { VMStatusConditionLabel } from '../VMStatusConditionLabel';

import { conditionsMock } from './mocks';

afterEach(cleanup);

test('VMStatusConditionLabel', async () => {
  const { reason, status, message } = conditionsMock[0];
  const { asFragment, getByText } = render(<VMStatusConditionLabel {...conditionsMock[0]} />);
  const firstRender = asFragment();

  expect(firstRender).toMatchSnapshot();

  // click on condition to open popover
  fireEvent.click(getByText(`${reason}=${status}`));
  const popoverMessage = await screen.findByText(message);

  expect(popoverMessage).toHaveTextContent(message);
});
