import React from 'react';

import { type TFunction } from 'i18next';

import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { Label } from '@patternfly/react-core';

import { CAPABILITY_INSTALL_STATE_CONFIG } from '../../utils/constants';
import { type CapabilityFeature, CapabilityInstallState } from '../../utils/types';

export const buildCapabilityRow = (
  feature: CapabilityFeature,
  installState: CapabilityInstallState,
  actions: ActionDropdownItemType[],
  t: TFunction,
) => {
  const { color, getLabel } = CAPABILITY_INSTALL_STATE_CONFIG[installState];

  return [
    {
      cell: (
        <>
          {feature.title} <HelpTextIcon bodyContent={feature.description} />
        </>
      ),
    },
    {
      cell: (
        <Label color={color} isCompact>
          {getLabel(t)}
        </Label>
      ),
    },
    {
      cell:
        installState !== CapabilityInstallState.Installed ? (
          <ActionsDropdown actions={actions} isKebabToggle />
        ) : null,
      props: { className: 'pf-v6-c-table__action' },
    },
  ];
};
