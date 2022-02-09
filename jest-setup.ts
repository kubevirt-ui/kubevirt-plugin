import { configure } from '@testing-library/dom';

import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

configure({
  testIdAttribute: 'data-test-id',
});
