import * as React from 'react';
import { Link } from 'react-router-dom';

import { DataImportCronModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataImportCron } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';

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
    <>
      <div className="pf-c-page__main-breadcrumb">
        <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
          <BreadcrumbItem>
            <Link to={`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/${DataImportCronModelRef}`}>
              {t('DataImportCrons')}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>{t('DataImportCron Details')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div className="co-m-nav-title co-m-nav-title--detail co-m-nav-title--breadcrumbs">
        <span className="co-m-pane__heading">
          <h1 className="co-m-pane__name co-resource-item">
            <span className="co-m-resource-icon co-m-resource-icon--lg">{t('DIC')}</span>
            <span data-test-id="resource-title" className="co-resource-item__resource-name">
              {name ?? dataImportCron?.metadata?.name}{' '}
            </span>
          </h1>
          <div className="co-actions">
            <DataImportCronActions dataImportCron={dataImportCron} />
          </div>
        </span>
      </div>
    </>
  );
};

export default DataImportCronPageTitle;
