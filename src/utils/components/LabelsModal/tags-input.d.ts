import { type DetailedHTMLProps, type HTMLAttributes } from 'react';

// console is declaring a new html element for some reason, we have to copy it for css reasons.
declare global {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface IntrinsicElements {
      'tags-input': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
