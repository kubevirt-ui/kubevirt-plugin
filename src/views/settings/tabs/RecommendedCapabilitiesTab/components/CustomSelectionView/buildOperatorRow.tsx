import React from 'react';

import { type TFunction } from 'i18next';

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
            {operator.packageName}
          </Button>
        ) : (
          operator.packageName
        ),
      },
      {
        cell: (
          <Label color={color} isCompact>
            {label}
          </Label>
        ),
      },
      { cell: null, props: { className: 'pf-v6-c-table__action' } },
    ],
  };
};
