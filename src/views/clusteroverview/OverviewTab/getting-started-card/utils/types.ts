import { ChangeEvent, MouseEvent, ReactElement } from 'react';

export interface GettingStartedLink {
  description?: string;
  external?: boolean;
  /** Default hyperlink location */
  href?: string;
  id: string;
  loading?: boolean;
  /** OnClick callback for the SimpleList item */
  onClick?: (event: ChangeEvent | MouseEvent) => void;
  secondaryLinkExternal?: boolean;
  secondaryLinkHref?: string;
  secondaryLinkText?: string;
  showSecondaryLink?: boolean;
  title?: ReactElement | string;
}
