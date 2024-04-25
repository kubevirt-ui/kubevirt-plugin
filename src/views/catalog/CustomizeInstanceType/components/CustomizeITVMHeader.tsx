import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { Text, TextVariants, Title } from '@patternfly/react-core';

const CutomizeITVMHeader: FC = () => {
  const { t } = useKubevirtTranslation();
  const {
    instanceTypeVMState: { selectedBootableVolume },
  } = useInstanceTypeVMStore();

  return (
    <div className="pf-c-page__main-breadcrumb wizard-header">
      <Title headingLevel="h1">{t('Customize and create VirtualMachine')}</Title>
      <Text component={TextVariants.small} data-test="wizard title help">
        {t('Bootable volume: {{bootableVolumeName}}', {
          bootableVolumeName: getName(selectedBootableVolume),
        })}
      </Text>
    </div>
  );
};

export default CutomizeITVMHeader;
