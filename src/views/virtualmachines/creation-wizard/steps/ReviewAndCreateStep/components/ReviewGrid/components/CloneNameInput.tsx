import React, { FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack } from '@patternfly/react-core';
import NameInput from '@virtualmachines/creation-wizard/components/NameInput';

const CloneNameInput: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionItem
      descriptionData={
        <Stack>
          <NameInput />
        </Stack>
      }
      descriptionHeader={t('Name')}
      isRequired
    />
  );
};

export default CloneNameInput;
