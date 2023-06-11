import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  ConditionsTable,
  K8sResourceCondition,
} from '@kubevirt-utils/components/ConditionsTable/ConditionsTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, PageSection, Title } from '@patternfly/react-core';

import { DataSourceDetailsGrid } from './components/DataSourceDetailsGrid.tsx/DataSourceDetailsGrid';

type DataSourceDetailsPageProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj?: V1beta1DataSource;
};

const DataSourceDetailsPage: React.FC<DataSourceDetailsPageProps> = ({ obj: dataSource }) => {
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
