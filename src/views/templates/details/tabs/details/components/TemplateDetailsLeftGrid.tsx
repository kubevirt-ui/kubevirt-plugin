import React, { FC } from 'react';

import DescriptionItemAnnotations from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemAnnotations';
import DescriptionItemCluster from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemCluster';
import DescriptionItemCreatedAt from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemCreatedAt';
import DescriptionItemDescription from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemDescription';
import DescriptionItemLabels from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemLabels';
import DescriptionItemName from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemName';
import DescriptionItemNamespace from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemNamespace';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateModel,
  getTemplateVirtualMachineObject,
} from '@kubevirt-utils/resources/template';
import { getMachineType } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getOperatingSystemName } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { DescriptionList } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../../hooks/useIsTemplateEditable';
import { TemplateDetailsGridProps } from '../TemplateDetailsPage';

import BootMethod from './BootMethod/BootMethod';
import BaseTemplate from './BaseTemplate';
import CPUMemory from './CPUMemory';
import DisplayName from './DisplayName';
import WorkloadProfile from './WorkloadProfile';

const TemplateDetailsLeftGrid: FC<TemplateDetailsGridProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const machineType = getMachineType(getTemplateVirtualMachineObject(template)) || NO_DATA_DASH;
  const { isTemplateEditable } = useEditTemplateAccessReview(template);
  const model = getTemplateModel(template);

  return (
    <DescriptionList>
      <DescriptionItemName model={model} resource={template} />
      <DescriptionItemCluster resource={template} />
      <DescriptionItemNamespace model={model} resource={template} />
      <DescriptionItemLabels editable={isTemplateEditable} model={model} resource={template} />
      <DescriptionItemAnnotations editable={isTemplateEditable} model={model} resource={template} />
      <DisplayName editable={isTemplateEditable} template={template} />
      <DescriptionItemDescription editable={isTemplateEditable} model={model} resource={template} />
      <DescriptionItem
        descriptionData={getOperatingSystemName(template)}
        descriptionHeader={t('Operating system')}
      />
      <WorkloadProfile editable={isTemplateEditable} template={template} />
      <CPUMemory editable={isTemplateEditable} template={template} />
      <DescriptionItem
        bodyContent={t('The QEMU machine type.')}
        descriptionData={machineType}
        descriptionHeader={t('Machine type')}
        isPopover
        olsObj={template}
        promptType={OLSPromptType.MACHINE_TYPE}
      />
      <BootMethod editable={isTemplateEditable} template={template} />
      <BaseTemplate template={template} />
      <DescriptionItemCreatedAt model={model} resource={template} />
      <OwnerDetailsItem obj={template} />
    </DescriptionList>
  );
};

export default TemplateDetailsLeftGrid;
