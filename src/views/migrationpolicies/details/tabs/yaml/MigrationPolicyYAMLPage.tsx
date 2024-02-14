import React, { FC } from 'react';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type MigrationPolicyYAMLPageProps = {
  obj?: V1alpha1MigrationPolicy;
};

const MigrationPolicyYAMLPage: FC<MigrationPolicyYAMLPageProps> = ({ obj: mp }) => {
  const loading = (
    <Bullseye>
      <Loading />
    </Bullseye>
  );
  return !mp ? (
    loading
  ) : (
    <React.Suspense fallback={loading}>
      <ResourceYAMLEditor initialResource={mp} />
    </React.Suspense>
  );
};

export default MigrationPolicyYAMLPage;
