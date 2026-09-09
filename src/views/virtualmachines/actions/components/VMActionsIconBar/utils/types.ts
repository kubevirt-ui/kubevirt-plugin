import { type ComponentClass } from 'react';

import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { type SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';

export type VMActionIconDetails = {
  action: ActionDropdownItemType;
  icon: ComponentClass<SVGIconProps, unknown>;
  iconClassname?: string;
  isDisabled?: boolean;
  isHidden?: boolean;
};
