import React, { memo } from 'react';

import { K8sIoApimachineryPkgApisMetaV1LabelSelectorRequirement } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { LabelGroup } from '@patternfly/react-core';

import { MigrationPolicyMatchExpressionSelectorLabel } from './MigrationPolicyMatchExpressionSelectorLabel';

type MigrationPolicyMatchExpressionSelectorListProps = {
  matchExpressions: K8sIoApimachineryPkgApisMetaV1LabelSelectorRequirement[];
  isVMILabel?: boolean;
};

export const MigrationPolicyMatchExpressionSelectorList: React.FC<MigrationPolicyMatchExpressionSelectorListProps> =
  memo(({ matchExpressions, isVMILabel }) => {
    if (isEmpty(matchExpressions)) return null;
    return (
      <LabelGroup>
        {matchExpressions?.map(({ key, operator, values }) => (
          <MigrationPolicyMatchExpressionSelectorLabel
            key={key}
            matchKey={key}
            operator={operator}
            values={values}
            isVMILabel={isVMILabel}
          />
        ))}
      </LabelGroup>
    );
  });
