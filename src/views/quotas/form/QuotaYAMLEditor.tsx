import React, { Suspense } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

const QuotaYAMLEditor = ({ initialYAML = '', onChange }) => (
  <Suspense fallback={<Loading />}>
    <ResourceYAMLEditor create hideHeader initialResource={initialYAML} onChange={onChange} />
  </Suspense>
);

export default QuotaYAMLEditor;
