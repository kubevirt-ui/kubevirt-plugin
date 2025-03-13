import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

import DeleteCheckupModal from '../../components/DeleteCheckupModal';
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
  const navigate = useNavigate();
  const { createModal } = useModal();
  const [isActionsOpen, setIsActionsOpen] = useState<boolean>(false);

  const onToggle = () => setIsActionsOpen((prevIsOpen) => !prevIsOpen);

  const Toggle = isKebab
    ? KebabToggle({ isExpanded: isActionsOpen, onClick: onToggle })
    : DropdownToggle({ isExpanded: isActionsOpen, onClick: onToggle, placeholder: t('Actions') });

  const deleteCheckup = () => {
    setIsActionsOpen(false);
    deleteStorageCheckup(configMap, jobs);
    navigate(`/k8s/ns/${getNamespace(configMap)}/checkups/storage`);
  };

  return (
    <Dropdown isOpen={isActionsOpen} onOpenChange={setIsActionsOpen} toggle={Toggle}>
      <DropdownList>
        <DropdownItem
          onClick={() =>
            createModal((props) => (
              <DeleteCheckupModal
                {...props}
                name={getName(configMap)}
                namespace={getNamespace(configMap)}
                onDelete={deleteCheckup}
              />
            ))
          }
          key="delete"
        >
          {t('Delete')}
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            setIsActionsOpen(false);
            return rerunStorageCheckup(configMap);
          }}
          isDisabled={configMap?.data?.[STATUS_SUCCEEDED] === undefined}
          key="rerun"
        >
          {t('Rerun')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default CheckupsStorageActions;
