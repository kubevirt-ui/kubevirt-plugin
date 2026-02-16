import React, { FC, Suspense, useState } from 'react';
import { load } from 'js-yaml';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { YAMLEditorProps } from '@kubevirt-utils/components/SyncedEditor/utils/types';
import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import useOnQuotaSubmit from './hooks/useOnQuotaSubmit';

const QuotaYAMLEditor: FC<YAMLEditorProps> = ({ initialYAML = '', isEdit = false, onChange }) => {
  const [error, setError] = useState<Error | null>(null);
  const onQuotaSubmit = useOnQuotaSubmit(setError, isEdit);

  const onSave = async (yaml: string) => {
    const quota = load(yaml) as ApplicationAwareQuota;
    await onQuotaSubmit(quota);
  };

  return (
    <Suspense fallback={<Loading />}>
      <ResourceYAMLEditor
        create={!isEdit}
        hideHeader
        initialResource={load(initialYAML)}
        onChange={onChange}
        onSave={onSave}
      />
      {error && <ErrorAlert error={error} />}
    </Suspense>
  );
};

export default QuotaYAMLEditor;
