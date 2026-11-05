import type { FC } from 'react';
import { Suspense } from 'react';

import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type DataVolumeYAMLPageProps = {
  obj?: V1beta1DataVolume;
};

const DataVolumeYAMLPage: FC<DataVolumeYAMLPageProps> = ({ obj: dataVolume }) => {
  const loading = (
    <Bullseye>
      <Loading />
    </Bullseye>
  );

  return !dataVolume ? (
    loading
  ) : (
    <Suspense fallback={loading}>
      <ResourceYAMLEditor initialResource={dataVolume} />
    </Suspense>
  );
};

export default DataVolumeYAMLPage;
