import React from 'react';
import DescriptionItem from 'src/views/templates/details/tabs/details/components//DescriptionItem';
import BootOrderItem from 'src/views/templates/details/tabs/details/components/BootOrderItem';
import BootSource from 'src/views/templates/details/tabs/details/components/BootSource';
import { TemplateDetailsGridProps } from 'src/views/templates/details/tabs/details/TemplateDetailsPage';
import { getTemplateProviderName } from 'src/views/templates/utils/selectors';

import HardwareDevices from '@kubevirt-utils/components/HardwareDevices/HardwareDevices';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateSupportLevel,
  getTemplateVirtualMachineObject,
} from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { DescriptionList } from '@patternfly/react-core';

const TemplateDetailsRightGrid: React.FC<TemplateDetailsGridProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionList>
      <BootOrderItem template={template} />
      <BootSource template={template} />
      <DescriptionItem title={t('Provider')} content={getTemplateProviderName(template)} />
      <DescriptionItem
        title={t('Support')}
        content={getTemplateSupportLevel(template) || NO_DATA_DASH}
      />
      <HardwareDevices vm={getTemplateVirtualMachineObject(template)} canEdit={false} />
    </DescriptionList>
  );
};
export default TemplateDetailsRightGrid;
