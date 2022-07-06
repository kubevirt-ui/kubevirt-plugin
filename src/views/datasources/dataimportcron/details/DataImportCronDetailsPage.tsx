import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1beta1DataImportCron } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  ConditionsTable,
  K8sResourceCondition,
} from '@kubevirt-utils/components/ConditionsTable/ConditionsTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, PageSection, Title } from '@patternfly/react-core';

import { DataImportCronDetailsGrid } from './DataImportCronDetailsGrid';

type DataImportCronDetailsPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}> & {
  obj?: V1beta1DataImportCron;
};

const DataImportCronDetailsPage: React.FC<DataImportCronDetailsPageProps> = ({
  obj: dataImportCron,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <div>
      <PageSection>
        <Title headingLevel="h2" className="co-section-heading">
          {t('DataImportCron details')}
        </Title>
        <DataImportCronDetailsGrid dataImportCron={dataImportCron} />
      </PageSection>
      <Divider />
      <PageSection>
        <Title headingLevel="h2" className="co-section-heading">
          {t('Conditions')}
        </Title>
        <ConditionsTable
          conditions={dataImportCron?.status?.conditions as K8sResourceCondition[]}
        />
      </PageSection>
    </div>
  );
};

export default DataImportCronDetailsPage;
