import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import ExpandSection from '../../../ExpandSection/ExpandSection';

import KernelSamepageMerging from './components/KernelSamepageMerging/KernelSamepageMerging';

const ResourceManagementSection: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection toggleText={t('Resource management')}>
      <KernelSamepageMerging />
    </ExpandSection>
  );
};

export default ResourceManagementSection;
