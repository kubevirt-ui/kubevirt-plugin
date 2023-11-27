import React from 'react';
import DescriptionItem from 'src/views/templates/details/tabs/details/components//DescriptionItem';
import BootOrderItem from 'src/views/templates/details/tabs/details/components/BootOrderItem';
import BootSource from 'src/views/templates/details/tabs/details/components/BootSource';
import { TemplateDetailsGridProps } from 'src/views/templates/details/tabs/details/TemplateDetailsPage';
import { getTemplateProviderName } from 'src/views/templates/utils/selectors';

import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import AdditionalResources from '@kubevirt-utils/components/AdditionalResources/AdditionalResources';
import HardwareDevices from '@kubevirt-utils/components/HardwareDevices/HardwareDevices';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateSupportLevel,
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../../hooks/useIsTemplateEditable';

const TemplateDetailsRightGrid: React.FC<TemplateDetailsGridProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);

  const providerContent = getTemplateProviderName(template)?.trim()
    ? getTemplateProviderName(template)?.trim()
    : t('Not available');

  const onSubmit = async (updatedVM: V1VirtualMachine) => {
    await k8sUpdate({
      data: replaceTemplateVM(template, updatedVM),
      model: TemplateModel,
      name: template?.metadata?.name,
      ns: template?.metadata?.namespace,
    });
  };

  return (
    <DescriptionList>
      <BootOrderItem template={template} />
      <BootSource template={template} />
      <DescriptionItem content={providerContent} title={t('Provider')} />
      <DescriptionItem
        content={getTemplateSupportLevel(template) || NO_DATA_DASH}
        title={t('Support')}
      />
      <DescriptionItem
        content={
          <HardwareDevices
            canEdit={isTemplateEditable}
            onSubmit={onSubmit}
            vm={getTemplateVirtualMachineObject(template)}
          />
        }
        title={t('Hardware devices')}
      />
      <AdditionalResources template={template} />
    </DescriptionList>
  );
};
export default TemplateDetailsRightGrid;
