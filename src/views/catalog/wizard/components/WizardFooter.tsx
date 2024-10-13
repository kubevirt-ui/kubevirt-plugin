import React, { FC, useCallback } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useWizardSourceAvailable } from '@catalog/utils/useWizardSourceAvailable';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import {
  RUNSTRATEGY_ALWAYS,
  RUNSTRATEGY_HALTED,
  RUNSTRATEGY_RERUNONFAILURE,
} from '@kubevirt-utils/constants/constants';
import { logTemplateFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import {
  CANCEL_CUSTOMIZE_VM_BUTTON_CLICKED,
  CUSTOMIZE_PAGE_CREATE_VM_BUTTON_CLICKED,
} from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { DISABLED_GUEST_SYSTEM_LOGS_ACCESS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getResourceUrl } from '@kubevirt-utils/resources/shared';
import { createHeadlessService } from '@kubevirt-utils/utils/headless-service';
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
  const { disableVmCreate, loaded: vmContextLoaded, updateVM, vm } = useWizardVMContext();
  const { isBootSourceAvailable, loaded: bootSourceLoaded } = useWizardSourceAvailable();
  const { createVM, error, loaded: vmCreateLoaded } = useWizardVmCreate();
  const { createModal } = useModal();
  const { featureEnabled: isDisableGuestSystemAccessLog } = useFeatures(
    DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  );

  const onCreate = () =>
    createVM({
      isDisableGuestSystemAccessLog,
      onFullfilled: (createdVM) => {
        createHeadlessService(createdVM);
        clearSessionStorageVM();
        navigate(getResourceUrl({ model: VirtualMachineModel, resource: createdVM }));
      },
    });

  const onSubmit = () => {
    logTemplateFlowEvent(CUSTOMIZE_PAGE_CREATE_VM_BUTTON_CLICKED, null, { vmName: getName(vm) });

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
      updateVM((draftVM) => {
        delete draftVM.spec.running;
        draftVM.spec.runStrategy = checked ? RUNSTRATEGY_ALWAYS : RUNSTRATEGY_HALTED;
      });
    },
    [updateVM],
  );

  const runStrategy = vm?.spec?.runStrategy;

  return (
    <footer className="vm-wizard-footer">
      <Stack hasGutter>
        <StackItem>
          <Checkbox
            isChecked={
              vm?.spec?.running ||
              runStrategy === RUNSTRATEGY_ALWAYS ||
              runStrategy === RUNSTRATEGY_RERUNONFAILURE
            }
            label={
              runStrategy
                ? t('Start this VirtualMachine after creation ({{runStrategy}})', {
                    runStrategy,
                  })
                : t('Start this VirtualMachine after creation')
            }
            id="start-after-create-checkbox"
            isDisabled={!loaded || disableVmCreate || !isBootSourceAvailable}
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
                  logTemplateFlowEvent(CANCEL_CUSTOMIZE_VM_BUTTON_CLICKED, null, {
                    vmName: getName(vm),
                  });
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
