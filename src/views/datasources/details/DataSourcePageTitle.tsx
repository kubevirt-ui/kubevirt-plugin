import React, { FC } from 'react';
import { Link } from 'react-router';

import { DataSourceModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import DetailsPageTitle from '@kubevirt-utils/components/DetailsPageTitle/DetailsPageTitle';
import PaneHeading from '@kubevirt-utils/components/PaneHeading/PaneHeading';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Breadcrumb, BreadcrumbItem, Label, Title } from '@patternfly/react-core';

import DataSourceActions from '../actions/DataSourceActions';
import useIsBootableVolumeContext from '../hooks/useIsBootableVolumeContext';
import { isDataSourceReady } from '../utils';

type DataSourcePageTitleProps = {
  dataSource: V1beta1DataSource;
  name: string;
  namespace: string;
};

const DataSourcePageTitle: FC<DataSourcePageTitleProps> = ({ dataSource, name, namespace }) => {
  const { t } = useKubevirtTranslation();
  const fromBootableVolumes = useIsBootableVolumeContext();
  const ns = namespace || DEFAULT_NAMESPACE;

  return (
    <DetailsPageTitle
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbItem>
            <Link
              to={
                fromBootableVolumes
                  ? `/k8s/ns/${ns}/bootablevolumes`
                  : `/k8s/ns/${ns}/${DataSourceModelRef}`
              }
            >
              {fromBootableVolumes ? t('Bootable volumes') : t('DataSources')}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            {fromBootableVolumes ? t('Bootable volume details') : t('DataSource details')}
          </BreadcrumbItem>
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
        <DataSourceActions dataSource={dataSource} isBootableVolume={fromBootableVolumes} />
      </PaneHeading>
    </DetailsPageTitle>
  );
};

export default DataSourcePageTitle;
