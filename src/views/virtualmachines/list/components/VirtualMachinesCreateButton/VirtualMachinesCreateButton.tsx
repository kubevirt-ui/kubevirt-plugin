import React, { FC, useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import DeveloperPreviewLabel from '@kubevirt-utils/components/DeveloperPreviewLabel/DeveloperPreviewLabel';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';

type VirtualMachinesCreateButtonProps = {
  namespace: string;
  buttonText?: string;
};

const VirtualMachinesCreateButton: FC<VirtualMachinesCreateButtonProps> = ({
  namespace,
  buttonText,
}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();

  const createItems = {
    catalog: t('From template'),
    volume: (
      <>
        {t('From volume')} <DeveloperPreviewLabel />
      </>
    ),
    yaml: t('From YAML'),
  };

  const { catalogURL, vmListPageURL } = useMemo(() => {
    const baseURL = `/k8s/ns/${namespace || DEFAULT_NAMESPACE}`;
    return {
      catalogURL: `${baseURL}/templatescatalog`,
      vmListPageURL: `${baseURL}/${VirtualMachineModelRef}`,
    };
  }, [namespace]);

  const onCreate = useCallback(
    (type: string) => {
      switch (type) {
        case 'catalog':
          return history.push(catalogURL);
        case 'volume':
          return history.push({
            pathname: `${catalogURL}/instanceTypes`,
            state: { previousURL: vmListPageURL },
          });
        default:
          return history.push(`${vmListPageURL}/~new`);
      }
    },
    [catalogURL, history, vmListPageURL],
  );

  return (
    <ListPageCreateDropdown
      items={createItems}
      onClick={onCreate}
      createAccessReview={{ groupVersionKind: VirtualMachineModelRef, namespace }}
    >
      {buttonText || t('Create')}
    </ListPageCreateDropdown>
  );
};

export default VirtualMachinesCreateButton;
