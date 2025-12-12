import React, { FC } from 'react';

import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
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
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
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

  return (
    <DescriptionList>
      <DescriptionItemName model={TemplateModel} resource={template} />
      <DescriptionItemCluster resource={template} />
      <DescriptionItemNamespace model={TemplateModel} resource={template} />
      <DescriptionItemLabels
        editable={isTemplateEditable}
        model={TemplateModel}
        resource={template}
      />
      <DescriptionItemAnnotations
        editable={isTemplateEditable}
        model={TemplateModel}
        resource={template}
      />
      <DisplayName editable={isTemplateEditable} template={template} />
      <DescriptionItemDescription
        editable={isTemplateEditable}
        model={TemplateModel}
        resource={template}
      />
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
      <DescriptionItemCreatedAt model={TemplateModel} resource={template} />
      <OwnerDetailsItem obj={template} />
    </DescriptionList>
  );
};

export default TemplateDetailsLeftGrid;
