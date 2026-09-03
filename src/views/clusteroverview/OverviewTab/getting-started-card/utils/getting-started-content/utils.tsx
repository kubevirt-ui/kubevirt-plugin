import { Link } from 'react-router';

import { type GettingStartedLink } from '../types';

export const getLinkComponent = (link: GettingStartedLink): 'a' | 'button' => {
  if (!link?.href) {
    return 'button';
  }
  if (link?.external) {
    return 'a';
  }
  return Link as never;
};
