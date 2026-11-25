import type { FC } from 'react';
import { useWatch } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DescriptionList, Title } from '@patternfly/react-core';

import { useBootableVolumeWizardForm } from '../../form/BootableVolumeWizardFormProvider';
import type { BootableVolumeWizardFormValues } from '../../form/types';
import ReviewRowItem from './components/ReviewRowItem';
import { getReviewRows } from './utils/getReviewRows';

const ReviewStep: FC = () => {
  const { t } = useKubevirtTranslation();
  const { control } = useBootableVolumeWizardForm();
  const formValues = useWatch({ control }) as BootableVolumeWizardFormValues;
  const rows = getReviewRows(formValues, t);

  return (
    <>
      <Title className="pf-v6-u-mb-md" headingLevel="h2">
        {t('Review')}
      </Title>
      <DescriptionList isHorizontal>
        {rows.map((row) => (
          <ReviewRowItem key={row.label} row={row} />
        ))}
      </DescriptionList>
    </>
  );
};

export default ReviewStep;
