import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NodeNetworkConfigurationPolicyModel } from '@kubevirt-utils/models';
import { getName, getResourceUrl } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { DescriptionList } from '@patternfly/react-core';

import { ConfigurationDetails } from '../../../utils/types';

type DetailsTabProps = {
  selectedConfiguration: ConfigurationDetails;
};

const DetailsTab: FC<DetailsTabProps> = ({ selectedConfiguration }) => {
  const { t } = useKubevirtTranslation();

  const nncpURL = selectedConfiguration?.nncp
    ? getResourceUrl({
        model: NodeNetworkConfigurationPolicyModel,
        resource: selectedConfiguration?.nncp,
      })
    : undefined;

  return (
    <DescriptionList className="pf-v6-u-my-xl">
      <DescriptionItem
        descriptionData={selectedConfiguration?.physicalNetworkName}
        descriptionHeader={t('Network name')}
      />
      <DescriptionItem
        descriptionData={
          nncpURL ? <Link to={nncpURL}>{getName(selectedConfiguration?.nncp)}</Link> : NO_DATA_DASH
        }
        descriptionHeader={t('Configuration name')}
      />
      <DescriptionItem
        descriptionData={selectedConfiguration?.description ?? NO_DATA_DASH}
        descriptionHeader={t('Description')}
      />
      <DescriptionItem
        descriptionData={selectedConfiguration?.uplink ?? NO_DATA_DASH}
        descriptionHeader={t('Uplink connection')}
      />
      <DescriptionItem
        descriptionData={selectedConfiguration?.aggregationMode ?? NO_DATA_DASH}
        descriptionHeader={t('Aggregation mode')}
      />
      <DescriptionItem
        descriptionData={selectedConfiguration?.mtu ?? NO_DATA_DASH}
        descriptionHeader={t('MTU')}
      />
    </DescriptionList>
  );
};

export default DetailsTab;
