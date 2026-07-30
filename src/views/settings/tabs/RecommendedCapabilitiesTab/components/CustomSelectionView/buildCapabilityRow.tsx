import React from 'react';

import { type TFunction } from 'i18next';

import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Label, Spinner } from '@patternfly/react-core';

import { CAPABILITY_INSTALL_STATE_CONFIG } from '../../utils/constants';
import {
  type CapabilityFeature,
  CapabilityInstallState,
  ConfigurationStatus,
} from '../../utils/types';
import ConfigurationStatusCell from '../ConfigurationStatusCell/ConfigurationStatusCell';

export const buildCapabilityRow = (
  feature: CapabilityFeature,
  installState: CapabilityInstallState,
  isInstalling: boolean,
  actions: ActionDropdownItemType[],
  t: TFunction,
  includeConfigCell = false,
  configStatus?: ConfigurationStatus,
) => {
  const { color, getLabel } = CAPABILITY_INSTALL_STATE_CONFIG[installState];

  return [
    {
      cell: (
        <>
          <span className="pf-v6-u-mr-xs">{feature.title}</span>
          <HelpTextIcon bodyContent={feature.description} />
        </>
      ),
    },
    {
      cell: isInstalling ? (
        <Spinner aria-label={t('Installing')} size="md" />
      ) : (
        <Label color={color} isCompact>
          {getLabel(t)}
        </Label>
      ),
    },
    ...(includeConfigCell
      ? [{ cell: <ConfigurationStatusCell configStatus={configStatus} /> }]
      : []),
    {
      cell:
        !isEmpty(actions) && installState !== CapabilityInstallState.Installed && !isInstalling ? (
          <ActionsDropdown actions={actions} isKebabToggle />
        ) : null,
      props: { className: 'pf-v6-c-table__action' },
    },
  ];
};
