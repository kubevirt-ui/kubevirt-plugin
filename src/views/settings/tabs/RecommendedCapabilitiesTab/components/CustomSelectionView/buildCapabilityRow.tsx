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

type BuildCapabilityRowParams = {
  actions: ActionDropdownItemType[];
  configStatus?: ConfigurationStatus;
  feature: CapabilityFeature;
  includeConfigCell?: boolean;
  installState: CapabilityInstallState;
  isInstalling: boolean;
  t: TFunction;
};

export const buildCapabilityRow = ({
  actions,
  configStatus,
  feature,
  includeConfigCell = false,
  installState,
  isInstalling,
  t,
}: BuildCapabilityRowParams) => {
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
