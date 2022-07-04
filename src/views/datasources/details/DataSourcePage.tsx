import * as React from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import DataSourceDetailsPage from './DataSourceDetailsPage';
import DataSourcePageTitle from './DataSourcePageTitle';
import DataSourceYAMLPage from './DataSourceYamlPage';

type DataSourcePageProps = {
  name: string;
  namespace: string;
  kind: string;
};

const DataSourceNavPage: React.FC<DataSourcePageProps> = ({ name, namespace, kind }) => {
  const { t } = useKubevirtTranslation();
  const [dataSource, loaded] = useK8sWatchResource<V1beta1DataSource>({
    kind,
    name,
    namespace,
  });

  const pages = React.useMemo(
    () => [
      {
        href: '',
        name: t('Details'),
        component: DataSourceDetailsPage,
      },
      {
        href: 'yaml',
        name: t('YAML'),
        component: DataSourceYAMLPage,
      },
    ],
    [t],
  );

  return (
    <>
      <DataSourcePageTitle dataSource={dataSource} namespace={namespace} name={name} />
      {loaded ? (
        <HorizontalNav pages={pages} resource={dataSource} />
      ) : (
        <Bullseye>
          <Loading />
        </Bullseye>
      )}
    </>
  );
};

export default DataSourceNavPage;
