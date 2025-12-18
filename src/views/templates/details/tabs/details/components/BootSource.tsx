import React from 'react';

import { V1Template } from '@kubevirt-ui-ext/kubevirt-api/console';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVMTemplateSource } from '@kubevirt-utils/resources/template';

type BootSourceProps = {
  template: V1Template;
};

const BootSource: React.FC<BootSourceProps> = ({ template }) => {
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
