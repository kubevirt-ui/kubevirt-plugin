import React from 'react';

import { type TFunction } from 'i18next';

import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Button, Label } from '@patternfly/react-core';
import { type DataViewTrTree } from '@patternfly/react-data-view';

import { getOperatorInstallStatusLabel } from '../../utils/constants';
import {
  type CapabilityFeatureOperator,
  type RecommendedCapabilityOperatorDetails,
} from '../../utils/types';

export const buildOperatorRow = (
  operator: CapabilityFeatureOperator,
  opDetails: RecommendedCapabilityOperatorDetails | undefined,
  navigate: (path: string) => void,
  t: TFunction,
  actions?: ActionDropdownItemType[],
  includeConfigCell = false,
): DataViewTrTree => {
  const { color, label } = getOperatorInstallStatusLabel(
    opDetails?.installState,
    opDetails?.isRedHatProvided,
    t,
  );

  const operatorHubURL = opDetails?.operatorHubURL;

  return {
    id: operator.packageName,
    row: [
      {
        cell: operatorHubURL ? (
          <Button isInline onClick={() => navigate(operatorHubURL)} variant="link">
            {operator.displayName}
          </Button>
        ) : (
          operator.displayName
        ),
      },
      {
        cell: (
          <Label color={color} isCompact>
            {label}
          </Label>
        ),
      },
      ...(includeConfigCell ? [{ cell: null }] : []),
      {
        cell: !isEmpty(actions) ? <ActionsDropdown actions={actions} isKebabToggle /> : null,
        props: { className: 'pf-v6-c-table__action' },
      },
    ],
  };
};
