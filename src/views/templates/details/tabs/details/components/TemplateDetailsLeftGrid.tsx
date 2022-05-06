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
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getOperatingSystemName } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { DescriptionList } from '@patternfly/react-core';

import CPUMemory from './CPUMemory';

const TemplateDetailsLeftGrid: React.FC<TemplateDetailsGridProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionList>
      <Name name={template?.metadata?.name} />
      <Namespace namespace={template?.metadata?.namespace} />
      <Labels labels={template?.metadata?.labels} />
      <Annotations count={Object.keys(template?.metadata?.annotations || {}).length} />
      <DescriptionItem
        title={t('Description')}
        content={template?.metadata?.annotations?.description || NO_DATA_DASH}
      />
      <DescriptionItem title={t('Operating system')} content={getOperatingSystemName(template)} />
      <DescriptionItem title={t('Workload profile')} content={useWorkloadProfile(template)} />
      <CPUMemory template={template} />
      <BaseTemplate template={template} />
      <CreatedAt template={template} />
      <Owner template={template} />
    </DescriptionList>
  );
};

export default TemplateDetailsLeftGrid;
