import React, { type FC } from 'react';
import { useParams } from 'react-router';

import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { SyncedEditor } from '@kubevirt-utils/components/SyncedEditor/SyncedEditor';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import {
  ApplicationAwareResourceQuotaModel,
  modelToGroupVersionKind,
} from '@kubevirt-utils/models';
import { type ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';

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
        formEditor={QuotaFormEditor}
        initialData={quota}
        isEdit
        yamlEditor={QuotaYAMLEditor}
      />
    </StateHandler>
  );
};

export default QuotaEditForm;
