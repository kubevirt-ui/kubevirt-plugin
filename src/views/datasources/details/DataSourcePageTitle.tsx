import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { DataSourceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem, Button, Label } from '@patternfly/react-core';

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
  const history = useHistory();

  return (
    <>
      <div className="pf-c-page__main-breadcrumb">
        <Breadcrumb className="pf-c-breadcrumb co-breadcrumb">
          <BreadcrumbItem>
            <Button
              variant="link"
              isInline
              isSmall
              onClick={() =>
                history.push(`/k8s/ns/${namespace || 'default'}/${DataSourceModelRef}`)
              }
            >
              {t('DataSources')}
            </Button>
          </BreadcrumbItem>
          <BreadcrumbItem>{t('DataSource Details')}</BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div className="co-m-nav-title co-m-nav-title--detail co-m-nav-title--breadcrumbs">
        <span className="co-m-pane__heading">
          <h1 className="co-m-pane__name co-resource-item">
            <span className="co-m-resource-icon co-m-resource-icon--lg">{t('DS')}</span>
            <span data-test-id="resource-title" className="co-resource-item__resource-name">
              {name ?? dataSource?.metadata?.name}{' '}
            </span>
            {isDataSourceReady(dataSource) && (
              <span className="dps-resource-item__resource-status hidden-xs">
                <Label color="green" variant="filled" isCompact>
                  {t('Ready')}
                </Label>
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
