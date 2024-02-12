import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { DataSourceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem, Label } from '@patternfly/react-core';

import DataSourceActions from '../actions/DataSourceActions';
import { isDataSourceReady } from '../utils';

type DataSourcePageTitleProps = {
  dataSource: V1beta1DataSource;
  name: string;
  namespace: string;
};

const DataSourcePageTitle: React.FC<DataSourcePageTitleProps> = ({
  dataSource,
  name,
  namespace,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <div className="pf-c-page__main-breadcrumb">
        <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
          <BreadcrumbItem>
            <Link to={`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/${DataSourceModelRef}`}>
              {t('DataSources')}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>{t('DataSource Details')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div className="co-m-nav-title co-m-nav-title--detail co-m-nav-title--breadcrumbs">
        <span className="co-m-pane__heading">
          <h1 className="co-m-pane__name co-resource-item">
            <span className="co-m-resource-icon co-m-resource-icon--lg">{t('DS')}</span>
            <span className="co-resource-item__resource-name" data-test-id="resource-title">
              {name ?? dataSource?.metadata?.name}{' '}
            </span>
            {isDataSourceReady(dataSource) && (
              <span className="dps-resource-item__resource-status hidden-xs">
                <Label isCompact>{t('Ready')}</Label>
              </span>
            )}
          </h1>
          <div className="co-actions">
            <DataSourceActions dataSource={dataSource} />
          </div>
        </span>
      </div>
    </>
  );
};

export default DataSourcePageTitle;
