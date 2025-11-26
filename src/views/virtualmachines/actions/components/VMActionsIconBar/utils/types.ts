import { ComponentClass } from 'react';

import { ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';

export type VMActionIconDetails = {
  action: ActionDropdownItemType;
  Icon: ComponentClass<SVGIconProps, any>;
  iconClassname?: string;
  isDisabled?: boolean;
  isHidden?: boolean;
};
