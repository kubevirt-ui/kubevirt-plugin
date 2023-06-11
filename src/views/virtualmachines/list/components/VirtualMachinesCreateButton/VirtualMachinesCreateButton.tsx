import React, { FC, useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
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
    volume: t('From volume'),
    yaml: t('From YAML'),
  };

  const catalogURL = useMemo(
    () => `/k8s/ns/${namespace || DEFAULT_NAMESPACE}/templatescatalog`,
    [namespace],
  );

  const onCreate = useCallback(
    (type: string) => {
      switch (type) {
        case 'catalog':
          return history.push(catalogURL);
        case 'volume':
          return history.push(`${catalogURL}/instanceTypes`);
        default:
          return history.push(
            `/k8s/ns/${namespace || DEFAULT_NAMESPACE}/${VirtualMachineModelRef}/~new`,
          );
      }
    },
    [catalogURL, history, namespace],
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
