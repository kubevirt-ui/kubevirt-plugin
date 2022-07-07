import { Link } from 'react-router-dom';

import { GettingStartedLink } from '../types';

export const getLinkComponent = (link: GettingStartedLink) => {
  if (!link?.href) {
    return 'button';
  } else if (link?.external) {
    return 'a';
  }
  return Link as any;
};
