import * as React from 'react';

export interface GettingStartedLink {
  description?: string;
  external?: boolean;
  /** Default hyperlink location */
  href?: string;
  id: string;
  loading?: boolean;
  /** OnClick callback for the SimpleList item */
  onClick?: (event: React.ChangeEvent | React.MouseEvent) => void;
  secondaryLinkExternal?: boolean;
  secondaryLinkHref?: string;
  secondaryLinkText?: string;
  showSecondaryLink?: boolean;
  title?: React.ReactElement | string;
}
