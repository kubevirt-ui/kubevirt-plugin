import React, { FCC, Suspense } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

type NetworkYAMLPageProps = {
  obj: ClusterUserDefinedNetworkKind;
};

const NetworkYAMLPage: FCC<NetworkYAMLPageProps> = ({ obj }) => {
  return !obj ? (
    <Loading />
  ) : (
    <Suspense fallback={<Loading />}>
      <ResourceYAMLEditor initialResource={obj} />
    </Suspense>
  );
};

export default NetworkYAMLPage;
