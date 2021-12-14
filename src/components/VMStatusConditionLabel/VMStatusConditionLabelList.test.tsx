import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { conditionsMock } from './mocks';
import { VMStatusConditionLabelList } from './VMStatusConditionLabel';

test('Render VMStatusConditionLabelList', () => {
  const tree = renderer.create(<VMStatusConditionLabelList conditions={conditionsMock} />).toJSON();
  expect(tree).toMatchSnapshot();
});
