import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { SyncedEditor } from '@kubevirt-utils/components/SyncedEditor/SyncedEditor';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import {
  ApplicationAwareResourceQuotaModel,
  modelToGroupVersionKind,
} from '@kubevirt-utils/models';
import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';

import QuotaFormTitle from './components/QuotaFormTitle';
import QuotaFormEditor from './QuotaFormEditor';
import QuotaYAMLEditor from './QuotaYAMLEditor';

const QuotaEditForm: FC = () => {
  const { name, ns: namespace } = useParams<{ name: string; ns?: string }>();

  const [quota, loaded, error] = useKubevirtWatchResource<ApplicationAwareQuota>({
    groupVersionKind: modelToGroupVersionKind(ApplicationAwareResourceQuotaModel),
    name,
    namespace,
  });

  return (
    <StateHandler error={error} hasData={!!quota} loaded={loaded} withBullseye>
      <QuotaFormTitle isEdit />
      <SyncedEditor
        displayConversionError
        FormEditor={QuotaFormEditor}
        initialData={quota}
        isEdit
        YAMLEditor={QuotaYAMLEditor}
      />
    </StateHandler>
  );
};

export default QuotaEditForm;
