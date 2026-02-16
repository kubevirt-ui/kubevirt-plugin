import React, { FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { EditorType } from '@kubevirt-utils/components/SyncedEditor/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ApplicationAwareResourceQuotaModel,
  modelToGroupVersionKind,
} from '@kubevirt-utils/models';
import { ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';

import { getQuotaCreateFormURL, getQuotaCreateFormYAMLURL } from '../../utils/url';

type QuotasCreateButtonProps = {
  namespace?: string;
};

const QuotasCreateButton: FC<QuotasCreateButtonProps> = ({ namespace }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  const createItems = {
    [EditorType.Form]: t('With form'),
    [EditorType.YAML]: t('With YAML'),
  };

  const onCreate = useCallback(
    (type: string) => {
      switch (type) {
        case EditorType.Form:
          return navigate(getQuotaCreateFormURL(namespace));
        default:
          return navigate(getQuotaCreateFormYAMLURL(namespace));
      }
    },
    [navigate, namespace],
  );

  return (
    <ListPageCreateDropdown
      createAccessReview={{
        groupVersionKind: modelToGroupVersionKind(ApplicationAwareResourceQuotaModel),
        namespace,
      }}
      items={createItems}
      onClick={onCreate}
    >
      {t('Create quota')}
    </ListPageCreateDropdown>
  );
};

export default QuotasCreateButton;
