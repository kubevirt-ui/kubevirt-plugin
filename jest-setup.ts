import { TextDecoder, TextEncoder } from 'util';

import { configure } from '@testing-library/dom';

import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

configure({
  testIdAttribute: 'data-test-id',
});
