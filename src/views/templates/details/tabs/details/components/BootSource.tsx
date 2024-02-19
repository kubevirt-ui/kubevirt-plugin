import React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVMTemplateSource } from '@kubevirt-utils/resources/template';

type BootSourceProps = {
  template: V1Template;
};

const BootSource: React.FC<BootSourceProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { isBootSourceAvailable } = useVMTemplateSource(template);

  return (
    <VirtualMachineDescriptionItem
      descriptionData={isBootSourceAvailable ? t('Available') : t('Unavailable')}
      descriptionHeader={t('Boot source')}
    />
  );
};

export default BootSource;
