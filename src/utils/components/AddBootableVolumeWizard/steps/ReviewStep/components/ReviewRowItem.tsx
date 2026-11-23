import type { FC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  useWizardContext,
} from '@patternfly/react-core';

import type { ReviewRow } from '../utils/getReviewRows';

type ReviewRowItemProps = {
  row: ReviewRow;
};

const ReviewRowItem: FC<ReviewRowItemProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  const { goToStepById } = useWizardContext();

  const getValueContent = (): ReactNode => {
    if (row.value?.trim()) {
      return row.value;
    }

    if (row.isOptional) {
      return t('Not set (optional)');
    }

    return (
      <Button isInline onClick={() => goToStepById?.(row.stepId)} variant={ButtonVariant.link}>
        {t('Required field not set – go to step')}
      </Button>
    );
  };

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{row.label}</DescriptionListTerm>
      <DescriptionListDescription>{getValueContent()}</DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default ReviewRowItem;
