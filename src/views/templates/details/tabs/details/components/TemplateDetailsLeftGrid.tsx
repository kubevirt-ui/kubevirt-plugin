import React from 'react';
import Annotations from 'src/views/templates/details/tabs/details/components/Annotations';
import BaseTemplate from 'src/views/templates/details/tabs/details/components/BaseTemplate';
import CreatedAt from 'src/views/templates/details/tabs/details/components/CreatedAt';
import DescriptionItem from 'src/views/templates/details/tabs/details/components/DescriptionItem';
import Labels from 'src/views/templates/details/tabs/details/components/Labels';
import Name from 'src/views/templates/details/tabs/details/components/Name';
import Namespace from 'src/views/templates/details/tabs/details/components/Namespace';
import Owner from 'src/views/templates/details/tabs/details/components/Owner';
import { TemplateDetailsGridProps } from 'src/views/templates/details/tabs/details/TemplateDetailsPage';
import useWorkloadProfile from 'src/views/templates/list/hooks/useWorkloadProfile';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getOperatingSystemName } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { DescriptionList } from '@patternfly/react-core';

import BootMethod from './BootMethod/BootMethod';
import CPUMemory from './CPUMemory';
import Description from './Description';

const TemplateDetailsLeftGrid: React.FC<TemplateDetailsGridProps> = ({ template, editable }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionList>
      <Name name={template?.metadata?.name} />
      <Namespace namespace={template?.metadata?.namespace} />
      <Labels template={template} editable={editable} />
      <Annotations template={template} editable={editable} />
      <Description template={template} editable={editable} />
      <DescriptionItem title={t('Operating system')} content={getOperatingSystemName(template)} />
      <DescriptionItem title={t('Workload profile')} content={useWorkloadProfile(template)} />
      <CPUMemory template={template} />
      <BootMethod template={template} />
      <BaseTemplate template={template} />
      <CreatedAt template={template} />
      <Owner template={template} />
    </DescriptionList>
  );
};

export default TemplateDetailsLeftGrid;
