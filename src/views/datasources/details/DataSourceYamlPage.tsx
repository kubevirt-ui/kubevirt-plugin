import React, { FC } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type DataSourceYAMLPageProps = {
  obj?: V1beta1DataSource;
};

const DataSourceYAMLPage: FC<DataSourceYAMLPageProps> = ({ obj: dataSource }) => {
  const loading = (
    <Bullseye>
      <Loading />
    </Bullseye>
  );
  return !dataSource ? (
    loading
  ) : (
    <React.Suspense fallback={loading}>
      <ResourceYAMLEditor initialResource={dataSource} />
    </React.Suspense>
  );
};

export default DataSourceYAMLPage;
