import React, { FC, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useWizardSourceAvailable } from '@catalog/utils/useWizardSourceAvailable';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getResourceUrl } from '@kubevirt-utils/resources/shared';
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
  const history = useHistory();
  const { t } = useKubevirtTranslation();
  const {
    disableVmCreate,
    loaded: vmContextLoaded,
    tabsData,
    updateTabsData,
    vm,
  } = useWizardVMContext();
  const { isBootSourceAvailable, loaded: bootSourceLoaded } = useWizardSourceAvailable();
  const { createVM, error, loaded: vmCreateLoaded } = useWizardVmCreate();
  const { createModal } = useModal();

  const [startVM, setStartVM] = useState<boolean>(
    isBootSourceAvailable && (tabsData?.startVM ?? true),
  );

  const onCreate = () =>
    createVM({
      onFullfilled: (createdVM) => {
        clearSessionStorageVM();
        history.push(getResourceUrl({ model: VirtualMachineModel, resource: createdVM }));
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

  const templateName = tabsData?.overview?.templateMetadata?.name;
  const templateNamespace = tabsData?.overview?.templateMetadata?.namespace;
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
            onChange={onChangeStartVM}
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
                  if (confirm(t('Are you sure you want to go back?'))) {
                    clearSessionStorageVM();
                    history.push(
                      `/k8s/ns/${namespace}/templatescatalog/customize?name=${templateName}&namespace=${templateNamespace}&defaultSourceExists=${isBootSourceAvailable}&vmName=${getName(
                        vm,
                      )}`,
                    );
                  }
                }}
                variant="secondary"
              >
                {t('Reset')}
              </Button>
            </SplitItem>

            <SplitItem>
              <Button
                onClick={() => {
                  if (confirm(t('Are you sure you want to cancel?'))) {
                    clearSessionStorageVM();
                    history.push(`/k8s/ns/${namespace}/templatescatalog`);
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
