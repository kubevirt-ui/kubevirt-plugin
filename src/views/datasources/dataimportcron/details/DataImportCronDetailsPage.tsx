import React, { FC } from 'react';
import { RouteComponentProps } from 'react-router';

import { V1beta1DataImportCron } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  ConditionsTable,
  K8sResourceCondition,
} from '@kubevirt-utils/components/ConditionsTable/ConditionsTable';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Divider, PageSection, PageSectionVariants, Title } from '@patternfly/react-core';

import { DataImportCronDetailsGrid } from './DataImportCronDetailsGrid';

type DataImportCronDetailsPageProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj?: V1beta1DataImportCron;
};

const DataImportCronDetailsPage: FC<DataImportCronDetailsPageProps> = ({ obj: dataImportCron }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div>
      <PageSection variant={PageSectionVariants.light}>
        <Title className="co-section-heading" headingLevel="h2">
          {t('DataImportCron details')}
        </Title>
        <DataImportCronDetailsGrid dataImportCron={dataImportCron} />
      </PageSection>
      <Divider />
      <PageSection variant={PageSectionVariants.light}>
        <Title className="co-section-heading" headingLevel="h2">
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
