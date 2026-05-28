import React, { FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Template, useVMTemplateSource } from '@kubevirt-utils/resources/template';

type BootSourceProps = {
  template: Template;
};

const BootSource: FC<BootSourceProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { isBootSourceAvailable } = useVMTemplateSource(template);

  return (
    <DescriptionItem
      descriptionData={isBootSourceAvailable ? t('Available') : t('Unavailable')}
      descriptionHeader={t('Boot source')}
    />
  );
};

export default BootSource;
