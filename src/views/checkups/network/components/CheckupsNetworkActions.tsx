import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownToggle,
  KebabToggle,
} from '@patternfly/react-core';

import { deleteNetworkCheckup, rerunNetworkCheckup, STATUS_SUCCEEDED } from '../utils/utils';

const CheckupsNetworkActions = ({
  configMap,
  isKebab = false,
}: {
  configMap: IoK8sApiCoreV1ConfigMap;
  isKebab?: boolean;
}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const [isActionsOpen, setIsActionsOpen] = useState<boolean>(false);
  const Toggle = isKebab ? KebabToggle : DropdownToggle;
  return (
    <Dropdown
      dropdownItems={[
        <DropdownItem
          onClick={() => {
            setIsActionsOpen(false);
            deleteNetworkCheckup(configMap);
            history.push(`/k8s/ns/${configMap?.metadata?.namespace}/checkups`);
          }}
          key="delete"
        >
          {t('Delete')}
        </DropdownItem>,
        <DropdownItem
          onClick={() => {
            setIsActionsOpen(false);
            return rerunNetworkCheckup(configMap);
          }}
          isDisabled={configMap?.data?.[STATUS_SUCCEEDED] === undefined}
          key="rerun"
        >
          {t('Rerun')}
        </DropdownItem>,
      ]}
      toggle={
        <Toggle id="toggle-actions" onToggle={setIsActionsOpen}>
          {t('Actions')}
        </Toggle>
      }
      isOpen={isActionsOpen}
      isPlain
      position={DropdownPosition.right}
    />
  );
};

export default CheckupsNetworkActions;
