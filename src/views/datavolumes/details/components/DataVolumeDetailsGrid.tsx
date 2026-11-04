import type { FC } from 'react';

import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import DescriptionItemAnnotations from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemAnnotations';
import DescriptionItemCreatedAt from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemCreatedAt';
import DescriptionItemLabels from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemLabels';
import DescriptionItemName from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemName';
import DescriptionItemNamespace from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemNamespace';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem, Label } from '@patternfly/react-core';

import {
  getDataVolumeCapacity,
  getDataVolumeClaimName,
  getDataVolumePhase,
  getDataVolumePhaseLabel,
  getDataVolumeProgress,
  getDataVolumeStorageClass,
} from '../../utils';

type DataVolumeDetailsGridProps = {
  dataVolume: V1beta1DataVolume;
};

const DataVolumeDetailsGrid: FC<DataVolumeDetailsGridProps> = ({ dataVolume }) => {
  const { t } = useKubevirtTranslation();
  const phase = getDataVolumePhase(dataVolume);
  const claimName = getDataVolumeClaimName(dataVolume);
  const { color, text } = getDataVolumePhaseLabel(phase);

  return (
    <Grid hasGutter>
      <GridItem span={5}>
        <DescriptionList>
          <DescriptionItemName model={DataVolumeModel} resource={dataVolume} />
          <DescriptionItemNamespace model={DataVolumeModel} resource={dataVolume} />
          <DescriptionItemLabels model={DataVolumeModel} resource={dataVolume} />
          <DescriptionItemAnnotations model={DataVolumeModel} resource={dataVolume} />
          <DescriptionItemCreatedAt model={DataVolumeModel} resource={dataVolume} />
          <OwnerDetailsItem obj={dataVolume} />
        </DescriptionList>
      </GridItem>
      <GridItem span={1} />
      <GridItem span={5}>
        <DescriptionList>
          <DescriptionItem
            descriptionData={phase ? <Label color={color}>{text}</Label> : NO_DATA_DASH}
            descriptionHeader={t('Status')}
          />
          <DescriptionItem
            descriptionData={getDataVolumeProgress(dataVolume) || NO_DATA_DASH}
            descriptionHeader={t('Progress')}
          />
          <DescriptionItem
            descriptionData={getDataVolumeCapacity(dataVolume) || NO_DATA_DASH}
            descriptionHeader={t('Capacity')}
          />
          <DescriptionItem
            descriptionData={
              claimName ? (
                <ResourceLink
                  groupVersionKind={modelToGroupVersionKind(PersistentVolumeClaimModel)}
                  name={claimName}
                  namespace={dataVolume?.metadata?.namespace}
                />
              ) : (
                NO_DATA_DASH
              )
            }
            descriptionHeader={t('PVC')}
          />
          <DescriptionItem
            descriptionData={getDataVolumeStorageClass(dataVolume) || NO_DATA_DASH}
            descriptionHeader={t('Storage class')}
          />
        </DescriptionList>
      </GridItem>
    </Grid>
  );
};

export default DataVolumeDetailsGrid;
