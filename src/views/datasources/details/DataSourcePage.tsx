import * as React from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import DataSourcePageTitle from './DataSourcePageTitle';
export type DataSourcePageProps = {
  name: string;
  namespace: string;
  kind: string;
};

const DataSourceNavPage: React.FC<DataSourcePageProps> = ({ name, namespace, kind, ...props }) => {
  console.log('props', props);

  const [dataSource] = useK8sWatchResource<V1beta1DataSource>({
    kind,
    name,
    namespace,
  });
  return (
    <>
      <DataSourcePageTitle dataSource={dataSource} />
      {/* <HorizontalNav pages={pages} resource={vm} /> */}
    </>
  );
};

export default DataSourceNavPage;
