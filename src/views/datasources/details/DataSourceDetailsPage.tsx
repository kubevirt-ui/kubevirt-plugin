import React, { FC } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer';
import {
  ConditionsTable,
  K8sResourceCondition,
} from '@kubevirt-utils/components/ConditionsTable/ConditionsTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, PageSection, Title } from '@patternfly/react-core';

import { DataSourceDetailsGrid } from './components/DataSourceDetailsGrid/DataSourceDetailsGrid';

type DataSourceDetailsPageProps = {
  obj?: V1beta1DataSource;
};

const DataSourceDetailsPage: FC<DataSourceDetailsPageProps> = ({ obj: dataSource }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div>
      <PageSection>
        <Title className="co-section-heading" headingLevel="h2">
          {t('DataSource details')}
        </Title>
        <DataSourceDetailsGrid dataSource={dataSource} />
      </PageSection>
      <Divider />
      <PageSection>
        <Title className="co-section-heading" headingLevel="h2">
          {t('Conditions')}
        </Title>
        <ConditionsTable conditions={dataSource?.status?.conditions as K8sResourceCondition[]} />
      </PageSection>
    </div>
  );
};

export default DataSourceDetailsPage;
