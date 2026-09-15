import { type FC, useCallback } from 'react';
import { useNavigate } from 'react-router';

import NoPermissionButton from '@kubevirt-utils/components/NoPermissionButton/NoPermissionButton';
import { EditorType } from '@kubevirt-utils/components/SyncedEditor/utils/types';
import useCanCreateResource from '@kubevirt-utils/hooks/useCanCreateResource';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ApplicationAwareResourceQuotaModel } from '@kubevirt-utils/models';
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
      if (type === EditorType.Form) {
        return navigate(getQuotaCreateFormURL(namespace));
      }
      return navigate(getQuotaCreateFormYAMLURL(namespace));
    },
    [navigate, namespace],
  );

  const canCreateQuota = useCanCreateResource({
    model: ApplicationAwareResourceQuotaModel,
    namespace,
  });

  const createButtonText = t('Create quota');

  if (!canCreateQuota) {
    return <NoPermissionButton>{createButtonText}</NoPermissionButton>;
  }

  return (
    <ListPageCreateDropdown items={createItems} onClick={onCreate}>
      {createButtonText}
    </ListPageCreateDropdown>
  );
};

export default QuotasCreateButton;
