import React, { FC } from 'react';
import Annotations from 'src/views/templates/details/tabs/details/components/Annotations';
import BaseTemplate from 'src/views/templates/details/tabs/details/components/BaseTemplate';
import CreatedAt from 'src/views/templates/details/tabs/details/components/CreatedAt';
import DescriptionItem from 'src/views/templates/details/tabs/details/components/DescriptionItem';
import Labels from 'src/views/templates/details/tabs/details/components/Labels';
import Name from 'src/views/templates/details/tabs/details/components/Name';
import Namespace from 'src/views/templates/details/tabs/details/components/Namespace';
import { TemplateDetailsGridProps } from 'src/views/templates/details/tabs/details/TemplateDetailsPage';

import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateVirtualMachineObject } from '@kubevirt-utils/resources/template';
import { getMachineType } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getOperatingSystemName } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { DescriptionList } from '@patternfly/react-core';

import useEditTemplateAccessReview from '../../../hooks/useIsTemplateEditable';

import BootMethod from './BootMethod/BootMethod';
import CPUMemory from './CPUMemory';
import Description from './Description';
import DisplayName from './DisplayName';
import WorkloadProfile from './WorkloadProfile';

const TemplateDetailsLeftGrid: FC<TemplateDetailsGridProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const machineType = getMachineType(getTemplateVirtualMachineObject(template)) || NO_DATA_DASH;
  const { isTemplateEditable } = useEditTemplateAccessReview(template);

  return (
    <DescriptionList>
      <Name name={template?.metadata?.name} />
      <Namespace namespace={template?.metadata?.namespace} />
      <Labels template={template} editable={isTemplateEditable} />
      <Annotations template={template} editable={isTemplateEditable} />
      <DisplayName template={template} editable={isTemplateEditable} />
      <Description template={template} editable={isTemplateEditable} />
      <DescriptionItem title={t('Operating system')} content={getOperatingSystemName(template)} />
      <WorkloadProfile template={template} editable={isTemplateEditable} />
      <CPUMemory template={template} />
      <DescriptionItem
        title={t('Machine type')}
        content={machineType}
        popoverContent={t(
          'The machine type defines the virtual hardware configuration while the operating system name and version refer to the hypervisor.',
        )}
      />
      <BootMethod template={template} />
      <BaseTemplate template={template} />
      <CreatedAt template={template} />
      <OwnerDetailsItem obj={template} />
    </DescriptionList>
  );
};

export default TemplateDetailsLeftGrid;
