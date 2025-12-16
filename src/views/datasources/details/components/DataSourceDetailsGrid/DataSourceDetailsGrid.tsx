import React from 'react';
import { getDataSourceCronJob } from 'src/views/datasources/utils';

import { PersistentVolumeClaimModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import PreferencePopoverContent from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/PreferenceSelect/PreferencePopoverContent';
import DescriptionItemAnnotations from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemAnnotations';
import DescriptionItemCreatedAt from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemCreatedAt';
import DescriptionItemLabels from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemLabels';
import DescriptionItemName from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemName';
import DescriptionItemNamespace from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemNamespace';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import OwnerDetailsItem from '@kubevirt-utils/components/OwnerDetailsItem/OwnerDetailsItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList, Grid, GridItem } from '@patternfly/react-core';

import DataSourceImportCronDescription from '../DataSourceImportCronDescription/DataSourceImportCronDescription';

import DataSourceInstanceTypeLink from './DataSourceInstanceTypeLink';
import DataSourcePreferenceLink from './DataSourcePreferenceLink';

type DataSourceDetailsGridProps = {
  dataSource: V1beta1DataSource;
};

export const DataSourceDetailsGrid: React.FC<DataSourceDetailsGridProps> = ({ dataSource }) => {
  const { t } = useKubevirtTranslation();
  const dataImportCron = getDataSourceCronJob(dataSource);
  const { name: pvcSourceName, namespace: pvcSourceNamespace } =
    dataSource?.spec?.source?.pvc || {};

  return (
    <Grid hasGutter>
      <GridItem span={5}>
        <DescriptionList>
          <DescriptionItemName model={DataSourceModel} resource={dataSource} />
          <DescriptionItemNamespace model={DataSourceModel} resource={dataSource} />
          <DescriptionItemLabels model={DataSourceModel} resource={dataSource} />
          <DescriptionItemAnnotations model={DataSourceModel} resource={dataSource} />
          <DescriptionItemCreatedAt model={DataSourceModel} resource={dataSource} />
          <OwnerDetailsItem obj={dataSource} />
        </DescriptionList>
      </GridItem>
      <GridItem span={1} />
      <GridItem span={5}>
        <DescriptionList>
          {dataImportCron && (
            <DataSourceImportCronDescription
              dataImportCronName={dataImportCron}
              namespace={dataSource?.metadata?.namespace}
            />
          )}
          {pvcSourceName && pvcSourceNamespace && (
            <DescriptionItem
              descriptionData={
                <ResourceLink
                  kind={PersistentVolumeClaimModel.kind}
                  name={pvcSourceName}
                  namespace={pvcSourceNamespace}
                />
              }
              descriptionHeader={t('Source')}
            />
          )}
          <DescriptionItem
            bodyContent={t('The default InstanceType for this volume.')}
            descriptionData={<DataSourceInstanceTypeLink dataSource={dataSource} />}
            descriptionHeader={t('Default InstanceType')}
            isPopover
          />
          <DescriptionItem
            bodyContent={<PreferencePopoverContent />}
            descriptionData={<DataSourcePreferenceLink dataSource={dataSource} />}
            descriptionHeader={t('Preference')}
            isPopover
            olsObj={dataSource}
            promptType={OLSPromptType.PREFERENCE}
          />
        </DescriptionList>
      </GridItem>
    </Grid>
  );
};
