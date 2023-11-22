import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { V1beta1DataImportCron } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type DataImportCronYAMLPageProps = RouteComponentProps<{
  name: string;
  ns: string;
}> & {
  obj?: V1beta1DataImportCron;
};

const DataImportCronYAMLPage: React.FC<DataImportCronYAMLPageProps> = ({ obj: dataImportCron }) => {
  const loading = (
    <Bullseye>
      <Loading />
    </Bullseye>
  );
  return !dataImportCron ? (
    loading
  ) : (
    <React.Suspense fallback={loading}>
      <ResourceYAMLEditor initialResource={dataImportCron} />
    </React.Suspense>
  );
};

export default DataImportCronYAMLPage;
