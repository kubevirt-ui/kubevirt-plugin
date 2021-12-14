import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { conditionsMock } from './mocks';
import { VMStatusConditionLabel } from './VMStatusConditionLabel';

test('Render VMStatusConditionLabel', () => {
  const tree = renderer.create(<VMStatusConditionLabel {...conditionsMock[0]} />).toJSON();
  expect(tree).toMatchSnapshot();
});
