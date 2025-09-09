import React, { FC, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { getCatalogURL, getVMListNamespacesURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

type VirtualMachinesCreateButtonProps = {
  buttonText?: string;
  namespace: string;
};

const VirtualMachinesCreateButton: FC<VirtualMachinesCreateButtonProps> = ({
  buttonText,
  namespace,
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const [hubClusterName] = useHubClusterName();
  const isACMPage = useIsACMPage();
  const cluster = useClusterParam();

  const createItems = {
    instanceType: t('From InstanceType'),
    //eslint-disable-next-line perfectionist/sort-objects
    catalog: t('From template'),
    yaml: t('With YAML'),
  };

  const catalogURL = useMemo(
    () =>
      getCatalogURL(isACMPage ? cluster || hubClusterName : null, namespace || DEFAULT_NAMESPACE),
    [namespace, cluster],
  );

  const onCreate = useCallback(
    (type: string) => {
      switch (type) {
        case 'catalog':
          return navigate(`${catalogURL}/template`);
        case 'instanceType':
          return navigate(catalogURL);
        default:
          return navigate(
            `${getVMListNamespacesURL(cluster, namespace || DEFAULT_NAMESPACE)}/~new`,
          );
      }
    },
    [catalogURL, navigate, namespace, cluster],
  );

  return (
    <ListPageCreateDropdown
      createAccessReview={{ groupVersionKind: VirtualMachineModelRef, namespace }}
      items={createItems}
      onClick={onCreate}
    >
      {buttonText || t('Create')}
    </ListPageCreateDropdown>
  );
};

export default VirtualMachinesCreateButton;
