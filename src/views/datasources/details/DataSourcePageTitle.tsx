import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { DataSourceModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem, Label, Title } from '@patternfly/react-core';

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
    <DetailsPageTitle
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/${DataSourceModelRef}`}>
              {t('DataSources')}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>{t('DataSource Details')}</BreadcrumbItem>
        </Breadcrumb>
      }
    >
      <PaneHeading>
        <Title className="co-resource-item" headingLevel="h1">
          <span className="co-m-resource-icon co-m-resource-icon--lg">{t('DS')}</span>
          <span data-test-id="resource-title">{name ?? dataSource?.metadata?.name} </span>
          {isDataSourceReady(dataSource) && (
            <span className="dps-resource-item__resource-status pf-v6-u-display-none pf-v6-u-display-inline-on-md">
              <Label isCompact>{t('Ready')}</Label>
            </span>
          )}
        </Title>
        <DataSourceActions dataSource={dataSource} />
      </PaneHeading>
    </DetailsPageTitle>
  );
};

export default DataSourcePageTitle;
