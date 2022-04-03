import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
  Title,
} from '@patternfly/react-core';
import { LinkIcon } from '@patternfly/react-icons';

import VirtualMachinesInstancesStatus from '../../../../../components/VirtualMachinesInstancesStatus';

import Annotations from './Annotations/Annotations';
import CreateAt from './CreateAt/CreateAt';
import Description from './Description/Description';
import Labels from './Labels/Labels';
import Name from './Name/Name';
import Namespace from './Namespace/Namespace';
import OperationSystem from './OperationSystem/OperationSystem';
import Owner from './Owner/Owner';

type DetailsProps = {
  vmi: V1VirtualMachineInstance;
  pathname: string;
};

const Details: React.FC<DetailsProps> = ({ vmi, pathname }) => {
  console.log('vmi: ', vmi);
  const { t } = useKubevirtTranslation();

  return (
    <div>
      <a href={`${pathname}#details`} className="link-icon">
        <LinkIcon size="sm" />
      </a>
      <Title headingLevel="h2" className="co-section-heading">
        {t('Virtual Machine Instance Details')}
      </Title>
      <Grid>
        <GridItem span={6}>
          <DescriptionList>
            <DescriptionListGroup>
              <Name name={vmi?.metadata?.name} />
              <Namespace namespace={vmi?.metadata?.namespace} />
              <Labels vmi={vmi} />
              <Annotations annotations={vmi?.metadata?.annotations} />
              <Description description={vmi?.metadata?.labels?.description} />
              <OperationSystem vmi={vmi} />
              <CreateAt timestamp={vmi?.metadata?.creationTimestamp} />
              <Owner
                namespace={vmi?.metadata?.namespace}
                ownerReferences={vmi?.metadata?.ownerReferences}
              />
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
        <GridItem span={6}>
          <DescriptionList>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
              <DescriptionListDescription>
                <VirtualMachinesInstancesStatus status={vmi?.status?.phase} />
              </DescriptionListDescription>
              <DescriptionListTerm>{t('Pod')}</DescriptionListTerm>
              <DescriptionListDescription>pod</DescriptionListDescription>
              <DescriptionListTerm>{t('Boot Order')}</DescriptionListTerm>
              <DescriptionListDescription>boot order</DescriptionListDescription>
              <DescriptionListTerm>{t('IP Address')}</DescriptionListTerm>
              <DescriptionListDescription>ip address</DescriptionListDescription>
              <DescriptionListTerm>{t('Hostname')}</DescriptionListTerm>
              <DescriptionListDescription>hostname</DescriptionListDescription>
              <DescriptionListTerm>{t('Time Zone')}</DescriptionListTerm>
              <DescriptionListDescription>time zone</DescriptionListDescription>
              <DescriptionListTerm>{t('Node')}</DescriptionListTerm>
              <DescriptionListDescription>node</DescriptionListDescription>
              <DescriptionListTerm>{t('Workload Profile')}</DescriptionListTerm>
              <DescriptionListDescription>workload profile</DescriptionListDescription>
              <DescriptionListTerm>{t('User Credentials')}</DescriptionListTerm>
              <DescriptionListDescription>user creds</DescriptionListDescription>
              <DescriptionListTerm>{t('SSH Access')}</DescriptionListTerm>
              <DescriptionListDescription>ssh access</DescriptionListDescription>
              <DescriptionListTerm>{t('Hardware devices')}</DescriptionListTerm>
              <DescriptionListDescription>hardware devices</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default Details;
