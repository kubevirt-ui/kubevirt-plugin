import React, { FC } from 'react';

import DescriptionItemAnnotations from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemAnnotations';
import DescriptionItemCreatedAt from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemCreatedAt';
import DescriptionItemLabels from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemLabels';
import DescriptionItemName from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemName';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import OwnerReferences from '@kubevirt-utils/components/OwnerReferences/OwnerReferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClusterUserDefinedNetworkModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList as DL, Grid, GridItem, PageSection, Title } from '@patternfly/react-core';

type NetworkDetailsPageProps = {
  obj: ClusterUserDefinedNetworkKind;
};

const NetworkDetailsPage: FC<NetworkDetailsPageProps> = ({ obj: network }) => {
  const { t } = useKubevirtTranslation();
  const name = getName(network);

  const [canUpdate] = useAccessReview({
    group: ClusterUserDefinedNetworkModel?.apiGroup,
    name,
    resource: ClusterUserDefinedNetworkModel?.plural,
    verb: 'patch',
  });

  if (!network)
    return (
      <PageSection>
        <Loading />
      </PageSection>
    );

  return (
    <PageSection>
      <Grid hasGutter>
        <GridItem md={6}>
          <Title className="pf-v6-u-mb-md" headingLevel="h2">
            {t('Virtual machine network details')}
          </Title>
          <DL className="co-m-pane__details" data-test-id="resource-summary">
            <DescriptionItemName
              label={t('Name')}
              model={ClusterUserDefinedNetworkModel}
              resource={network}
            />
            <DescriptionItemLabels
              editable={canUpdate}
              model={ClusterUserDefinedNetworkModel}
              resource={network}
            />
            <DescriptionItemAnnotations
              editable={canUpdate}
              model={ClusterUserDefinedNetworkModel}
              resource={network}
            />
            <DescriptionItemCreatedAt model={ClusterUserDefinedNetworkModel} resource={network} />
            <DescriptionItem
              breadcrumb={`${ClusterUserDefinedNetworkModel.label}.metadata.ownerReferences`}
              descriptionData={<OwnerReferences obj={network} />}
              descriptionHeader={t('Owner')}
            />
          </DL>
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default NetworkDetailsPage;
