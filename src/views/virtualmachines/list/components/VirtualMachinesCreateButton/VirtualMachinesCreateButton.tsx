import React, { FC, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreateDropdown } from '@openshift-console/dynamic-plugin-sdk';

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

  const createItems = {
    instanceType: t('From InstanceType'),
    //eslint-disable-next-line perfectionist/sort-objects
    catalog: t('From template'),
    yaml: t('With YAML'),
  };

  const catalogURL = useMemo(
    () => `/k8s/ns/${namespace || DEFAULT_NAMESPACE}/catalog`,
    [namespace],
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
            `/k8s/ns/${namespace || DEFAULT_NAMESPACE}/${VirtualMachineModelRef}/~new`,
          );
      }
    },
    [catalogURL, navigate, namespace],
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
