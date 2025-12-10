import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

import DeleteCheckupModal from '../../components/DeleteCheckupModal';
import { CHECKUP_URLS } from '../../utils/constants';
import { getCheckupImageFromNewestJob } from '../../utils/utils';
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

  const checkupImage = getCheckupImageFromNewestJob(jobs);

  const { createModal } = useModal();
  const [isActionsOpen, setIsActionsOpen] = useState<boolean>(false);

  const onToggle = () => setIsActionsOpen((prevIsOpen) => !prevIsOpen);

  const Toggle = isKebab
    ? KebabToggle({ isExpanded: isActionsOpen, onClick: onToggle })
    : DropdownToggle({ children: t('Actions'), isExpanded: isActionsOpen, onClick: onToggle });

  const deleteCheckup = () => {
    setIsActionsOpen(false);
    deleteStorageCheckup(configMap, jobs);
    navigate(`/k8s/ns/${getNamespace(configMap)}/checkups/${CHECKUP_URLS.STORAGE}`);
  };

  return (
    <Dropdown isOpen={isActionsOpen} onOpenChange={setIsActionsOpen} toggle={Toggle}>
      <DropdownList>
        <DropdownItem
          onClick={async () => {
            setIsActionsOpen(false);
            try {
              await rerunStorageCheckup(configMap, checkupImage);
            } catch (error) {
              kubevirtConsole.log('Failed to rerun checkup:', error);
            }
          }}
          isDisabled={!checkupImage}
          key="rerun"
        >
          {t('Rerun')}
        </DropdownItem>
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
      </DropdownList>
    </Dropdown>
  );
};

export default CheckupsStorageActions;
