import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { useWizardSourceAvailable } from '@catalog/utils/useWizardSourceAvailable';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
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

export const WizardFooter: React.FC<{ namespace: string }> = ({ namespace }) => {
  const history = useHistory();
  const { t } = useKubevirtTranslation();
  const { tabsData, disableVmCreate, loaded: vmContextLoaded } = useWizardVMContext();
  const { isBootSourceAvailable, loaded: bootSourceLoaded } = useWizardSourceAvailable();
  const { createVM, error, loaded: vmCreateLoaded } = useWizardVmCreate();
  const { createModal } = useModal();

  const [startVM, setStartVM] = React.useState(true);

  const onCreate = () =>
    createVM({
      startVM,
      onFullfilled: (createdVM) => {
        clearSessionStorageVM();
        history.push(getResourceUrl(VirtualMachineModel, createdVM));
      },
    });

  const onSubmit = () => {
    if (isBootSourceAvailable) {
      return onCreate();
    }

    createModal(({ isOpen, onClose }) => (
      <WizardNoBootModal
        namespace={namespace}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onCreate}
      />
    ));
  };

  const templateName = tabsData?.overview?.templateMetadata?.name;
  const templateNamespace = tabsData?.overview?.templateMetadata?.namespace;
  const loaded = vmContextLoaded && vmCreateLoaded && bootSourceLoaded;

  React.useEffect(() => {
    if (loaded && startVM !== isBootSourceAvailable) {
      setStartVM(isBootSourceAvailable);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, isBootSourceAvailable]);

  return (
    <footer className="vm-wizard-footer">
      <Stack hasGutter>
        <StackItem>
          <Checkbox
            id="start-after-create-checkbox"
            isDisabled={!loaded || disableVmCreate}
            isChecked={startVM}
            onChange={(v) => setStartVM(v)}
            label={t('Start this VirtualMachine after creation')}
          />
        </StackItem>
        <StackItem />
        {error && (
          <StackItem>
            <Alert variant="danger" title={t('Create VirtualMachine error')} isInline>
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
                variant="primary"
                onClick={onSubmit}
              >
                {t('Create VirtualMachine')}
              </Button>
            </SplitItem>
            <SplitItem>
              <Button
                variant="secondary"
                onClick={() => {
                  if (confirm(t('Are you sure you want to go back?'))) {
                    clearSessionStorageVM();
                    history.push(
                      `/k8s/ns/${namespace}/templatescatalog/customize?name=${templateName}&namespace=${templateNamespace}`,
                    );
                  }
                }}
              >
                {t('Back')}
              </Button>
            </SplitItem>

            <SplitItem>
              <Button
                variant="link"
                onClick={() => {
                  if (confirm(t('Are you sure you want to cancel?'))) {
                    clearSessionStorageVM();
                    history.push(`/k8s/ns/${namespace}/templatescatalog`);
                  }
                }}
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
