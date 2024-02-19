import React, { FC, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useWizardSourceAvailable } from '@catalog/utils/useWizardSourceAvailable';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { DISABLED_GUEST_SYSTEM_LOGS_ACCESS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import {
  Alert,
  Button,
  Checkbox,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { useWizardVmCreate } from '../../utils/useWizardVmCreate';
import { clearSessionStorageVM, useWizardVMContext } from '../../utils/WizardVMContext';

import { WizardNoBootModal } from './WizardNoBootModal';

export const WizardFooter: FC<{ namespace: string }> = ({ namespace }) => {
  const navigate = useNavigate();
  const { t } = useKubevirtTranslation();
  const {
    disableVmCreate,
    loaded: vmContextLoaded,
    tabsData,
    updateTabsData,
  } = useWizardVMContext();
  const { isBootSourceAvailable, loaded: bootSourceLoaded } = useWizardSourceAvailable();
  const { createVM, error, loaded: vmCreateLoaded } = useWizardVmCreate();
  const { createModal } = useModal();
  const { featureEnabled: isDisableGuestSystemAccessLog } = useFeatures(
    DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  );
  const [startVM, setStartVM] = useState<boolean>(
    isBootSourceAvailable && (tabsData?.startVM ?? true),
  );

  const onCreate = () =>
    createVM({
      isDisableGuestSystemAccessLog,
      onFullfilled: (createdVM) => {
        clearSessionStorageVM();
        navigate(getResourceUrl({ model: VirtualMachineModel, resource: createdVM }));
      },
      startVM,
    });

  const onSubmit = () => {
    if (isBootSourceAvailable) {
      return onCreate();
    }

    createModal(({ isOpen, onClose }) => (
      <WizardNoBootModal
        isOpen={isOpen}
        namespace={namespace}
        onClose={onClose}
        onSubmit={onCreate}
      />
    ));
  };

  const loaded = vmContextLoaded && vmCreateLoaded && bootSourceLoaded;

  const onChangeStartVM = useCallback(
    (checked: boolean) => {
      setStartVM(checked);
      updateTabsData((currentTabsData) => {
        return { ...currentTabsData, startVM: checked };
      });
    },
    [updateTabsData],
  );

  return (
    <footer className="vm-wizard-footer">
      <Stack hasGutter>
        <StackItem>
          <Checkbox
            id="start-after-create-checkbox"
            isChecked={startVM}
            isDisabled={!loaded || disableVmCreate || !isBootSourceAvailable}
            label={t('Start this VirtualMachine after creation')}
            onChange={(_, checked: boolean) => onChangeStartVM(checked)}
          />
        </StackItem>
        <StackItem />
        {error && (
          <StackItem>
            <Alert isInline title={t('Create VirtualMachine error')} variant="danger">
              {error.message}
            </Alert>
          </StackItem>
        )}
        <div data-test-id="create-virtual-machine">
          <Split hasGutter>
            <SplitItem>
              <Button
                isDisabled={!loaded || disableVmCreate}
                isLoading={!vmCreateLoaded}
                onClick={onSubmit}
                variant="primary"
              >
                {t('Create VirtualMachine')}
              </Button>
            </SplitItem>
            <SplitItem>
              <Button
                onClick={() => {
                  if (confirm(t('Are you sure you want to cancel?'))) {
                    clearSessionStorageVM();
                    navigate(`/k8s/ns/${namespace}/catalog/template`);
                  }
                }}
                variant="link"
              >
                {t('Cancel')}
              </Button>
            </SplitItem>
          </Split>
        </div>
      </Stack>
    </footer>
  );
};
