import type { FC } from 'react';
import React, { Suspense } from 'react';

import type { V1beta1DataImportCron } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type DataImportCronYAMLPageProps = {
  obj?: V1beta1DataImportCron;
};

const DataImportCronYAMLPage: FC<DataImportCronYAMLPageProps> = ({ obj: dataImportCron }) => {
  const loading = (
    <Bullseye>
      <Loading />
    </Bullseye>
  );
  return !dataImportCron ? (
    loading
  ) : (
    <Suspense fallback={loading}>
      <ResourceYAMLEditor initialResource={dataImportCron} />
    </Suspense>
  );
};

export default DataImportCronYAMLPage;
