import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';
import { Breadcrumb, BreadcrumbItem, Label } from '@patternfly/react-core';

import DataSourceActions from '../actions/DataSourceActions';
import { isDataSourceReady } from '../utils';

type DataSourcePageTitleProps = {
  dataSource: V1beta1DataSource;
  name: string;
};

const DataSourcePageTitle: FC<DataSourcePageTitleProps> = ({ dataSource, name }) => {
  const { t } = useKubevirtTranslation();
  const lastNamespacePath = useLastNamespacePath();

  return (
    <>
      <div className="pf-c-page__main-breadcrumb">
        <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
          <BreadcrumbItem>
            <Link to={`/k8s/${lastNamespacePath}/bootablevolumes`}>{t('Bootable volumes')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>{t('DataSource details')}</BreadcrumbItem>
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
