import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import DeleteModal from '@kubevirt-utils/components/DeleteModal/DeleteModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getStorageCheckupURL } from '@kubevirt-utils/resources/checkups/urls';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { Dropdown, DropdownItem, DropdownList } from '@patternfly/react-core';

import { CHECKUP_URLS } from '../../utils/constants';
import { createCheckupRerunHandler } from '../../utils/createCheckupRerunHandler';
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
  const toast = useKubevirtToast();
  const [isActionsOpen, setIsActionsOpen] = useState<boolean>(false);

  const onToggle = () => setIsActionsOpen((prevIsOpen) => !prevIsOpen);

  const Toggle = isKebab
    ? KebabToggle({ isExpanded: isActionsOpen, onClick: onToggle })
    : DropdownToggle({ children: t('Actions'), isExpanded: isActionsOpen, onClick: onToggle });

  const checkupName = getName(configMap);

  const handleRerunAction = useMemo(
    () =>
      createCheckupRerunHandler({
        configMap,
        createModal,
        getUrl: getStorageCheckupURL,
        isKebab,
        jobs,
        navigate,
        rerun: () => rerunStorageCheckup(configMap, checkupImage, jobs),
        runningJobWarningMessage: t(
          'This storage checkup is currently running. If you rerun the checkup, the running job will be deleted.',
        ),
        t,
        toast,
      }),
    [checkupImage, configMap, createModal, isKebab, jobs, navigate, t, toast],
  );

  const deleteCheckup = async (): Promise<void> => {
    setIsActionsOpen(false);
    try {
      await deleteStorageCheckup(configMap, jobs);
      toast.addSuccessToast({
        persistInDrawer: false,
        title: t('Checkup {{name}} deleted successfully', { name: checkupName }),
      });
      navigate(`/k8s/ns/${getNamespace(configMap)}/checkups/${CHECKUP_URLS.STORAGE}`);
    } catch (error) {
      toast.addDangerToast({
        content: error instanceof Error ? error.message : t('An unknown error occurred'),
        persistInDrawer: false,
        title: t('Failed to delete checkup'),
      });
    }
  };

  return (
    <Dropdown isOpen={isActionsOpen} onOpenChange={setIsActionsOpen} toggle={Toggle}>
      <DropdownList>
        <DropdownItem
          onClick={() => {
            setIsActionsOpen(false);
            handleRerunAction();
          }}
          isDisabled={!checkupImage}
          key="rerun"
        >
          {t('Rerun')}
        </DropdownItem>
        <DropdownItem
          onClick={() =>
            createModal((props) => (
              <DeleteModal
                {...props}
                headerText={t('Delete checkup')}
                obj={{ metadata: { name: getName(configMap), namespace: getNamespace(configMap) } }}
                onDeleteSubmit={deleteCheckup}
                shouldRedirect={false}
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
