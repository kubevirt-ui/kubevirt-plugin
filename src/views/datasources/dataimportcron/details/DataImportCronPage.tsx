import * as React from 'react';

import { DataImportCronModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataImportCron } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import DataImportCronDetailsPage from './DataImportCronDetailsPage';
import DataImportCronPageTitle from './DataImportCronPageTitle';
import DataImportCronYAMLPage from './DataImportCronYamlPage';

type DataImportCronPageProps = {
  kind: string;
  name: string;
  namespace: string;
};

const DataImportCronNavPage: React.FC<DataImportCronPageProps> = ({ name, namespace }) => {
  const { t } = useKubevirtTranslation();
  const [dataImportCron, loaded] = useK8sWatchResource<V1beta1DataImportCron>({
    groupVersionKind: DataImportCronModelGroupVersionKind,
    name,
    namespace,
  });

  const pages = React.useMemo(
    () => [
      {
        component: DataImportCronDetailsPage,
        href: '',
        name: t('Details'),
      },
      {
        component: DataImportCronYAMLPage,
        href: 'yaml',
        name: t('YAML'),
      },
    ],
    [t],
  );

  return (
    <>
      <DataImportCronPageTitle dataImportCron={dataImportCron} name={name} namespace={namespace} />
      {loaded ? (
        <HorizontalNav pages={pages} resource={dataImportCron} />
      ) : (
        <Bullseye>
          <Loading />
        </Bullseye>
      )}
    </>
  );
};

export default DataImportCronNavPage;
