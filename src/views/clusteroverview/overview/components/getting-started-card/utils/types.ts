import * as React from 'react';

export interface GettingStartedLink {
  id: string;
  loading?: boolean;
  title?: string | React.ReactElement;
  external?: boolean;
  /** Default hyperlink location */
  href?: string;
  /** OnClick callback for the SimpleList item */
  onClick?: (event: React.MouseEvent | React.ChangeEvent) => void;
}
