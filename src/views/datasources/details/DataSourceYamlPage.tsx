import type { FC } from 'react';
import React, { Suspense } from 'react';

import type { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
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
    <Suspense fallback={loading}>
      <ResourceYAMLEditor initialResource={dataSource} />
    </Suspense>
  );
};

export default DataSourceYAMLPage;
