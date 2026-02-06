import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { Breadcrumb, BreadcrumbItem, Title } from '@patternfly/react-core';

import VMNetworkActions from '../../actions/VMNetworkActions';
import { VM_NETWORKS_PATH } from '../../constants';

type VMNetworkTitleProps = {
  network: ClusterUserDefinedNetworkKind;
};

const VMNetworkTitle: FC<VMNetworkTitleProps> = ({ network }) => {
  const { t } = useKubevirtTranslation();

  return (
    <DetailsPageTitle
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={VM_NETWORKS_PATH}>{t('Virtual machine networks')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>{t('Virtual machine network details')}</BreadcrumbItem>
        </Breadcrumb>
      }
    >
      <PaneHeading>
        <Title headingLevel="h1">{getName(network)}</Title>
        <VMNetworkActions isKebabToggle={false} obj={network} />
      </PaneHeading>
    </DetailsPageTitle>
  );
};

export default VMNetworkTitle;
