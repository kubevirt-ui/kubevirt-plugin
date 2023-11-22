import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Dropdown,
  DropdownItem,
  DropdownPosition,
  DropdownToggle,
  KebabToggle,
} from '@patternfly/react-core';

import { STATUS_SUCCEEDED } from '../../utils/utils';
import { deleteStorageCheckup, rerunStorageCheckup } from '../utils/utils';

const CheckupsStorageActions = ({
  configMap,
  isKebab = false,
  jobs,
}: {
  configMap: IoK8sApiCoreV1ConfigMap;
  isKebab?: boolean;
  jobs: IoK8sApiBatchV1Job[];
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
            deleteStorageCheckup(configMap, jobs);
            history.push(`/k8s/ns/${configMap?.metadata?.namespace}/checkups/storage`);
          }}
          key="delete"
        >
          {t('Delete')}
        </DropdownItem>,
        <DropdownItem
          onClick={() => {
            setIsActionsOpen(false);
            return rerunStorageCheckup(configMap);
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

export default CheckupsStorageActions;
