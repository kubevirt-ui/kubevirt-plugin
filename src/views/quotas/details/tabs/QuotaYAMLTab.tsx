import React, { FC, Suspense } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type QuotaYAMLTabProps = {
  obj?: ApplicationAwareQuota;
};

const QuotaYAMLTab: FC<QuotaYAMLTabProps> = ({ obj: quota }) => {
  const loading = (
    <Bullseye>
      <Loading />
    </Bullseye>
  );

  return !quota ? (
    loading
  ) : (
    <Suspense fallback={loading}>
      <ResourceYAMLEditor initialResource={quota} />
    </Suspense>
  );
};

export default QuotaYAMLTab;
