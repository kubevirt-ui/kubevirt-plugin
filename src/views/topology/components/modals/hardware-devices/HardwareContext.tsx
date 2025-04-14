import { createContext } from 'react';

const HWContext = createContext({
  isBlur: false,
  isNameEmpty: false,
  isNameUsed: false,
});

export default HWContext;
