import React, { FC, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { VirtualMachineModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMListPath } from '@kubevirt-utils/resources/vm';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { getACMVMListURL, getCatalogURL } from '@multicluster/urls';
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
  const clusterParam = useClusterParam();
  const cluster = clusterParam || hubClusterName;
  const selectedNamespace = namespace || DEFAULT_NAMESPACE;

  const createItems = {
    instanceType: t('From InstanceType'),
    //eslint-disable-next-line perfectionist/sort-objects
    catalog: t('From template'),
    yaml: t('With YAML'),
  };

  const catalogURL = useMemo(
    () => getCatalogURL(isACMPage ? cluster : null, selectedNamespace),
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
            isACMPage
              ? `${getACMVMListURL(cluster, selectedNamespace)}/~new`
              : `${getVMListPath(selectedNamespace)}/~new`,
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
