import React, { useCallback } from 'react';
import BootOrderItem from 'src/views/templates/details/tabs/details/components/BootOrderItem';
import BootSource from 'src/views/templates/details/tabs/details/components/BootSource';
import { TemplateDetailsGridProps } from 'src/views/templates/details/tabs/details/TemplateDetailsPage';
import { getTemplateProviderName } from 'src/views/templates/utils/selectors';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import AdditionalResources from '@kubevirt-utils/components/AdditionalResources/AdditionalResources';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import HardwareDevices from '@kubevirt-utils/components/HardwareDevices/HardwareDevices';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateSupportLevel,
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
  updateTemplate,
} from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { DescriptionList } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../../hooks/useIsTemplateEditable';

const TemplateDetailsRightGrid: React.FC<TemplateDetailsGridProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);

  const providerContent = getTemplateProviderName(template)?.trim()
    ? getTemplateProviderName(template)?.trim()
    : t('Not available');

  const onSubmit = useCallback(
    async (updatedVM: V1VirtualMachine) => {
      await updateTemplate(replaceTemplateVM(template, updatedVM));
    },
    [template],
  );

  return (
    <DescriptionList>
      <BootOrderItem template={template} />
      <BootSource template={template} />
      <DescriptionItem descriptionData={providerContent} descriptionHeader={t('Provider')} />
      <DescriptionItem
        descriptionData={getTemplateSupportLevel(template) || NO_DATA_DASH}
        descriptionHeader={t('Support')}
      />
      <DescriptionItem
        descriptionData={
          <HardwareDevices
            canEdit={isTemplateEditable}
            onSubmit={onSubmit}
            vm={getTemplateVirtualMachineObject(template)}
          />
        }
        descriptionHeader={t('Hardware devices')}
      />
      <AdditionalResources template={template} />
    </DescriptionList>
  );
};
export default TemplateDetailsRightGrid;
