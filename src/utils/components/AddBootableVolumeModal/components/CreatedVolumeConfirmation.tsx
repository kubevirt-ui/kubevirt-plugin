import React, { FC } from 'react';
import { Link } from 'react-router';

import {
  DataSourceModel,
  DataSourceModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getResourceUrl } from '@kubevirt-utils/resources/shared';
import { ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, Flex, FlexItem } from '@patternfly/react-core';

import { appendBootableVolumeContext } from '../../../../views/datasources/hooks/useIsBootableVolumeContext';

type CreatedVolumeConfirmationProps = {
  createdVolume: V1beta1DataSource;
};

const CreatedVolumeConfirmation: FC<CreatedVolumeConfirmationProps> = ({ createdVolume }) => {
  const { t } = useKubevirtTranslation();

  const volumeUrl = appendBootableVolumeContext(
    getResourceUrl({ model: DataSourceModel, resource: createdVolume }),
  );

  return (
    <Alert
      isInline
      title={t('Bootable volume was created successfully')}
      variant={AlertVariant.success}
    >
      <Flex alignItems={{ default: 'alignItemsCenter' }} columnGap={{ default: 'columnGapXs' }}>
        <FlexItem>
          <ResourceIcon groupVersionKind={DataSourceModelGroupVersionKind} />
        </FlexItem>
        <FlexItem>
          <Link to={volumeUrl}>{getName(createdVolume)}</Link>
        </FlexItem>
      </Flex>
    </Alert>
  );
};

export default CreatedVolumeConfirmation;
