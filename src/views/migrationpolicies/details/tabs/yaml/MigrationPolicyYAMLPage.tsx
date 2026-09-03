import React, { type FC, Suspense } from 'react';

import { type V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type MigrationPolicyYAMLPageProps = {
  obj?: V1alpha1MigrationPolicy;
};

const MigrationPolicyYAMLPage: FC<MigrationPolicyYAMLPageProps> = ({ obj: migrationPolicy }) => {
  const loading = (
    <Bullseye>
      <Loading />
    </Bullseye>
  );
  return !migrationPolicy ? (
    loading
  ) : (
    <Suspense fallback={loading}>
      <ResourceYAMLEditor initialResource={migrationPolicy} />
    </Suspense>
  );
};

export default MigrationPolicyYAMLPage;
