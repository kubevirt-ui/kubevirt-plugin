import React from 'react';
import { isCommonVMTemplate } from 'src/views/templates/utils';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getGPUDevices, getHostDevices } from '@kubevirt-utils/resources/vm';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Text,
} from '@patternfly/react-core';

type HardwareDevicesProps = {
  template: V1Template;
};

const HardwareDevices: React.FC<HardwareDevicesProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const vmObject = getTemplateVirtualMachineObject(template);
  const hostDevicesCount = getHostDevices(vmObject)?.length || 0;
  const gpusCount = getGPUDevices(vmObject)?.length || 0;
  const isCommonTemplate = isCommonVMTemplate(template);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Hardware devices')}</DescriptionListTerm>
      <DescriptionListDescription>
        <Text className={isCommonTemplate ? 'text-muted' : ''}>
          {t('{{count}} GPU devices', {
            count: hostDevicesCount,
          })}
        </Text>
        <Text className={isCommonTemplate ? 'text-muted' : ''}>
          {t('{{count}} Host devices', {
            count: gpusCount,
          })}
        </Text>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default HardwareDevices;
