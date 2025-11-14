import React, { FC } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import { ApplicationAwareQuota } from '../../form/types';

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
    <React.Suspense fallback={loading}>
      <ResourceYAMLEditor initialResource={quota} />
    </React.Suspense>
  );
};

export default QuotaYAMLTab;
