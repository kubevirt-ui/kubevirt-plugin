import React, { FC } from 'react';

import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getMachineType } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getOperatingSystemName } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { DescriptionList } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../../hooks/useIsTemplateEditable';
import { TemplateDetailsGridProps } from '../TemplateDetailsPage';

import BootMethod from './BootMethod/BootMethod';
import Annotations from './Annotations';
import BaseTemplate from './BaseTemplate';
import CPUMemory from './CPUMemory';
import CreatedAt from './CreatedAt';
import Description from './Description';
import DisplayName from './DisplayName';
import Labels from './Labels';
import Name from './Name';
import Namespace from './Namespace';
import WorkloadProfile from './WorkloadProfile';

const TemplateDetailsLeftGrid: FC<TemplateDetailsGridProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const machineType = getMachineType(getTemplateVirtualMachineObject(template)) || NO_DATA_DASH;
  const { isTemplateEditable } = useEditTemplateAccessReview(template);

  return (
    <DescriptionList className="pf-c-description-list">
      <Name name={getName(template)} />
      <Namespace namespace={getNamespace(template)} />
      <Labels editable={isTemplateEditable} template={template} />
      <Annotations editable={isTemplateEditable} template={template} />
      <DisplayName editable={isTemplateEditable} template={template} />
      <Description editable={isTemplateEditable} template={template} />
      <VirtualMachineDescriptionItem
        descriptionData={getOperatingSystemName(template)}
        descriptionHeader={t('Operating system')}
      />
      <WorkloadProfile editable={isTemplateEditable} template={template} />
      <CPUMemory editable={isTemplateEditable} template={template} />
      <VirtualMachineDescriptionItem
        bodyContent={t(
          'The machine type defines the virtual hardware configuration while the operating system name and version refer to the hypervisor.',
        )}
        descriptionData={machineType}
        descriptionHeader={t('Machine type')}
        isPopover
      />
      <BootMethod editable={isTemplateEditable} template={template} />
      <BaseTemplate template={template} />
      <CreatedAt template={template} />
      <OwnerDetailsItem obj={template} />
    </DescriptionList>
  );
};

export default TemplateDetailsLeftGrid;
