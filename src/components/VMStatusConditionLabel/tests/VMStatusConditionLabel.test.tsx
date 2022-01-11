import * as React from 'react';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { VMStatusConditionLabel } from '../VMStatusConditionLabel';

import { conditionsMock } from './mocks';

afterEach(cleanup);

test('VMStatusConditionLabel', async () => {
  const { lastProbeTime, lastTransitionTime, message, reason, status, type } = conditionsMock[0];
  const { asFragment, getByText } = render(
    <VMStatusConditionLabel
      lastTransitionTime={lastTransitionTime}
      lastProbeTime={lastProbeTime}
      message={message}
      reason={reason}
      status={status}
      type={type}
    />,
  );
  const firstRender = asFragment();

  expect(firstRender).toMatchSnapshot();

  // click on condition to open popover
  fireEvent.click(getByText(`${reason}=${status}`));
  const popoverMessage = await screen.findByText(message);

  expect(popoverMessage).toHaveTextContent(message);
});
