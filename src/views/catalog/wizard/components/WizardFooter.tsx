import React, { FC, useCallback } from 'react';
import { useNavigate } from 'react-router';

import { useWizardSourceAvailable } from '@catalog/utils/useWizardSourceAvailable';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useRunStrategyToggle } from '@kubevirt-utils/components/RunStrategyModal/useRunStrategyToggle';
import {
  applyRunStrategyToSpec,
  getStartAfterCreationLabel,
  START_AFTER_CREATION_CHECKBOX_ID,
} from '@kubevirt-utils/components/RunStrategyModal/utils';
import { logTemplateFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import {
  CANCEL_CUSTOMIZE_VM_BUTTON_CLICKED,
  CUSTOMIZE_PAGE_CREATE_VM_BUTTON_CLICKED,
} from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { DISABLED_GUEST_SYSTEM_LOGS_ACCESS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { createHeadlessService } from '@kubevirt-utils/utils/headless-service';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { getCatalogURL, getVMURL } from '@multicluster/urls';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Checkbox,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { useWizardVMCreate } from '../../utils/useWizardVMCreate';
import { clearSessionStorageVM, useWizardVMContext } from '../../utils/WizardVMContext';

import { WizardNoBootModal } from './WizardNoBootModal';

export const WizardFooter: FC<{ namespace: string }> = ({ namespace }) => {
  const navigate = useNavigate();
  const cluster = useClusterParam();
  const { t } = useKubevirtTranslation();
  const [isUDNManagedNamespace] = useNamespaceUDN(namespace);
  const { disableVmCreate, loaded: vmContextLoaded, updateVM, vm } = useWizardVMContext();
  const { isBootSourceAvailable, loaded: bootSourceLoaded } = useWizardSourceAvailable();
  const { createVM, error, loaded: vmCreateLoaded } = useWizardVMCreate();
  const { createModal } = useModal();
  const { featureEnabled: isDisableGuestSystemAccessLog } = useFeatures(
    DISABLED_GUEST_SYSTEM_LOGS_ACCESS,
  );

  const onCreate = async () =>
    createVM({
      isDisableGuestSystemAccessLog,
      onFullfilled: (createdVM) => {
        if (!isUDNManagedNamespace) createHeadlessService(createdVM);

        clearSessionStorageVM();
        navigate(getVMURL(cluster, namespace, getName(createdVM)));
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

  const { isStartChecked, onToggle } = useRunStrategyToggle(vm);

  const onChangeStartVM = useCallback(
    (checked: boolean) => {
      const { newStrategy } = onToggle(checked);
      updateVM((draftVM) => applyRunStrategyToSpec(draftVM.spec, newStrategy));
    },
    [onToggle, updateVM],
  );

  return (
    <footer className="vm-wizard-footer">
      <Stack hasGutter>
        <StackItem>
          <Checkbox
            id={START_AFTER_CREATION_CHECKBOX_ID}
            isChecked={isStartChecked}
            isDisabled={!loaded || disableVmCreate || !isBootSourceAvailable}
            label={getStartAfterCreationLabel(t)}
            onChange={(_, checked: boolean) => onChangeStartVM(checked)}
          />
        </StackItem>
        <StackItem />
        {error && (
          <StackItem>
            <Alert isInline title={t('Create VirtualMachine error')} variant={AlertVariant.danger}>
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
                    navigate(`${getCatalogURL(cluster, namespace)}/template`);
                  }
                }}
                variant={ButtonVariant.link}
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
