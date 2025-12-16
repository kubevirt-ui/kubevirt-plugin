import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { icon } from '@kubevirt-utils/resources/vmi';
import { Label, Title } from '@patternfly/react-core';

import VirtualMachineInstanceActions from '../list/components/VirtualMachineInstanceActions/VirtualMachineInstanceAction';
import VirtualMachineInstanceBreadcrumb from '../list/components/VirtualMachineInstanceBreadcrumb/VirtualMachineInstanceBreadcrumb';

type VirtualMachinesInstancePageHeaderProps = {
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesInstancePageHeader: React.FC<VirtualMachinesInstancePageHeaderProps> = ({
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const status = vmi?.status?.phase;
  const IconComponent = icon?.[status];
  return (
    <DetailsPageTitle breadcrumb={<VirtualMachineInstanceBreadcrumb />}>
      <PaneHeading>
        <Title headingLevel="h1">
          <span className={`co-m-resource-icon co-m-resource-icon--lg`}>{t('VMI')}</span>
          {vmi?.metadata?.name}{' '}
          <Label icon={<IconComponent />} isCompact>
            {status}
          </Label>
        </Title>
        <VirtualMachineInstanceActions vmi={vmi} />
      </PaneHeading>
    </DetailsPageTitle>
  );
};

export default VirtualMachinesInstancePageHeader;
