import React, { FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import DescriptionInput from '@virtualmachines/creation-wizard/components/DescriptionInput';

const CloneDescriptionInput: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionItem descriptionData={<DescriptionInput />} descriptionHeader={t('Description')} />
  );
};

export default CloneDescriptionInput;
