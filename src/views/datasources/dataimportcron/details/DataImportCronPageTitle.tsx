import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { DataImportCronModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataImportCron } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem, Title } from '@patternfly/react-core';

import DataImportCronActions from '../actions/DataImportCronActions';

type DataImportCronPageTitleProps = {
  dataImportCron: V1beta1DataImportCron;
  name: string;
  namespace: string;
};

const DataImportCronPageTitle: React.FC<DataImportCronPageTitleProps> = ({
  dataImportCron,
  name,
  namespace,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <DetailsPageTitle
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/${DataImportCronModelRef}`}>
              {t('DataImportCrons')}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>{t('DataImportCron Details')}</BreadcrumbItem>
        </Breadcrumb>
      }
    >
      <PaneHeading>
        <Title className="co-resource-item" headingLevel="h1">
          <span className="co-m-resource-icon co-m-resource-icon--lg">{t('DIC')}</span>
          <span data-test-id="resource-title">{name ?? dataImportCron?.metadata?.name} </span>
        </Title>
        <DataImportCronActions dataImportCron={dataImportCron} />
      </PaneHeading>
    </DetailsPageTitle>
  );
};

export default DataImportCronPageTitle;
