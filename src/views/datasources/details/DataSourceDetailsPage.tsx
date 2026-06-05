import React, { FC } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { ConditionsTable } from '@kubevirt-utils/components/ConditionsTable/ConditionsTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, PageSection, Title } from '@patternfly/react-core';

import useIsBootableVolumeContext from '../hooks/useIsBootableVolumeContext';

import { DataSourceDetailsGrid } from './components/DataSourceDetailsGrid/DataSourceDetailsGrid';

type DataSourceDetailsPageProps = {
  obj?: V1beta1DataSource;
};

const DataSourceDetailsPage: FC<DataSourceDetailsPageProps> = ({ obj: dataSource }) => {
  const { t } = useKubevirtTranslation();
  const isBootableVolume = useIsBootableVolumeContext();

  return (
    <div>
      <PageSection>
        <Title className="co-section-heading" headingLevel="h2">
          {isBootableVolume ? t('Bootable volume details') : t('DataSource details')}
        </Title>
        <DataSourceDetailsGrid dataSource={dataSource} />
      </PageSection>
      <Divider />
      <PageSection>
        <Title className="co-section-heading" headingLevel="h2">
          {t('Conditions')}
        </Title>
        <ConditionsTable conditions={dataSource?.status?.conditions} />
      </PageSection>
    </div>
  );
};

export default DataSourceDetailsPage;
