import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Flex, FlexItem, Grid, GridItem, Title } from '@patternfly/react-core';
import { LinkIcon } from '@patternfly/react-icons';

import VirtualMachineDetailsLeftGrid from '../grid/leftGrid/VirtualMachineDetailsLeftGrid';
import VirtualMachineDetailsRightGrid from '../grid/rightGrid/VirtualMachineDetailsRightGrid';

import './VirtualMachinesDetailsSection.scss';

type DetailsSectionProps = {
  pathname: string;
  vm: V1VirtualMachine;
};

const DetailsSection: FC<DetailsSectionProps> = ({ pathname, vm }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="VirtualMachinesDetailsSection">
      <a className="link-icon" href={`${pathname}#details`}>
        <LinkIcon size="sm" />
      </a>
      <Title className="co-section-heading" headingLevel="h2">
        <Flex>
          <FlexItem>{t('VirtualMachine details')} </FlexItem>
        </Flex>
      </Title>
      <Grid hasGutter>
        <VirtualMachineDetailsLeftGrid vm={vm} />
        <GridItem span={1}>{/* Spacer */}</GridItem>
        <VirtualMachineDetailsRightGrid vm={vm} />
      </Grid>
    </div>
  );
};

export default DetailsSection;
