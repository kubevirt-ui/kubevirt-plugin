import * as React from 'react';

import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import useHideYamlTab, { removeYamlTabs } from '@kubevirt-utils/hooks/useHideYamlTab';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import DataSourceDetailsPage from './DataSourceDetailsPage';
import DataSourcePageTitle from './DataSourcePageTitle';
import DataSourceYAMLPage from './DataSourceYamlPage';

type DataSourcePageProps = {
  kind: string;
  name: string;
  namespace: string;
};

const DataSourceNavPage: React.FC<DataSourcePageProps> = ({ kind, name, namespace }) => {
  const { t } = useKubevirtTranslation();
  const [dataSource, loaded] = useK8sWatchResource<V1beta1DataSource>({
    kind,
    name,
    namespace,
  });

  const { hideYamlTab } = useHideYamlTab();
  const pages = React.useMemo(
    () =>
      removeYamlTabs(
        [
          {
            component: DataSourceDetailsPage,
            href: '',
            name: t('Details'),
          },
          {
            component: DataSourceYAMLPage,
            href: 'yaml',
            name: t('YAML'),
          },
        ],
        hideYamlTab,
      ),
    [t, hideYamlTab],
  );

  return (
    <>
      <DataSourcePageTitle dataSource={dataSource} name={name} namespace={namespace} />
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
