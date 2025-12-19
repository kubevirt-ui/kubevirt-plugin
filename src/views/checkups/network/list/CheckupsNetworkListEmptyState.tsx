import React, { FC, useState } from 'react';

import useNADsData from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/useNADsData';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import CheckupsEmptyState from '../../components/CheckupsEmptyState/CheckupsEmptyState';
import { CHECKUP_URLS } from '../../utils/constants';
import { installOrRemoveCheckupsNetworkPermissions } from '../utils/utils';

type CheckupsNetworkListEmptyStateProps = {
  isPermitted: boolean;
};

const CheckupsNetworkListEmptyState: FC<CheckupsNetworkListEmptyStateProps> = ({ isPermitted }) => {
  const { t } = useKubevirtTranslation();
  const namespace = useActiveNamespace();
  const isAllNamespaces = namespace === ALL_NAMESPACES_SESSION_KEY;
  const validNamespace = isAllNamespaces ? null : namespace;
  const cluster = useClusterParam();

  const { nads } = useNADsData(validNamespace, cluster);
  const hasNADsInNamespace = !isEmpty(nads.filter((nad) => getNamespace(nad) === namespace));

  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <CheckupsEmptyState
      bottomFooterActions={
        !hasNADsInNamespace && !isAllNamespaces ? (
          <p className="pf-v6-u-text-color-subtle">
            {t('Add a NetworkAttachmentDefinition to this namespace in order to use checkups')}
          </p>
        ) : null
      }
      permissionsButtonProps={{
        isDisabled: !hasNADsInNamespace,
        onClick: async () => {
          setIsLoading(true);
          try {
            await installOrRemoveCheckupsNetworkPermissions(namespace, cluster, isPermitted);
          } finally {
            setIsLoading(false);
          }
        },
      }}
      checkupType={CHECKUP_URLS.NETWORK}
      isLoading={isLoading}
      isPermitted={isPermitted}
      namespace={namespace}
    />
  );
};

export default CheckupsNetworkListEmptyState;
