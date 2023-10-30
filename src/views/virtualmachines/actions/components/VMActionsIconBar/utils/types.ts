import { ComponentClass } from 'react';

import { Action } from '@openshift-console/dynamic-plugin-sdk';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';

export type VMActionIconDetails = {
  action: Action;
  Icon: ComponentClass<SVGIconProps, any>;
  iconClassname?: string;
  isHidden: boolean;
};
