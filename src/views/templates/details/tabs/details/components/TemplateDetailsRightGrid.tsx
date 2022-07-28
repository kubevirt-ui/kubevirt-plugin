import React from 'react';
import DescriptionItem from 'src/views/templates/details/tabs/details/components//DescriptionItem';
import BootOrderItem from 'src/views/templates/details/tabs/details/components/BootOrderItem';
import BootSource from 'src/views/templates/details/tabs/details/components/BootSource';
import { TemplateDetailsGridProps } from 'src/views/templates/details/tabs/details/TemplateDetailsPage';
import { getTemplateProviderName } from 'src/views/templates/utils/selectors';

import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
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

import { isCommonVMTemplate } from '../../../../utils';

const TemplateDetailsRightGrid: React.FC<TemplateDetailsGridProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();

  const providerContent = getTemplateProviderName(template)?.trim()
    ? getTemplateProviderName(template)?.trim()
    : t('Not available');

  const onSubmit = async (updatedVM: V1VirtualMachine) => {
    await k8sUpdate({
      model: TemplateModel,
      data: replaceTemplateVM(template, updatedVM),
      ns: template?.metadata?.namespace,
      name: template?.metadata?.name,
    });
  };

  return (
    <DescriptionList>
      <BootOrderItem template={template} />
      <BootSource template={template} />
      <DescriptionItem title={t('Provider')} content={providerContent} />
      <DescriptionItem
        title={t('Support')}
        content={getTemplateSupportLevel(template) || NO_DATA_DASH}
      />
      <DescriptionItem
        title={t('Hardware devices')}
        content={
          <HardwareDevices
            vm={getTemplateVirtualMachineObject(template)}
            canEdit={!isCommonVMTemplate(template)}
            onSubmit={onSubmit}
          />
        }
      />
    </DescriptionList>
  );
};
export default TemplateDetailsRightGrid;
