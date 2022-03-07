import * as React from 'react';
import { useHistory } from 'react-router-dom';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';
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

import { useVmCreate } from '../../utils/useVmCreate';
import { clearSessionStorageVM, useWizardVMContext } from '../../utils/WizardVMContext';

export const WizardFooter: React.FC<{ namespace: string }> = ({ namespace }) => {
  const history = useHistory();
  const { t } = useKubevirtTranslation();
  const { params } = useURLParams();
  const templateName = params.get('name');
  const templateNamespace = params.get('namespace');

  const [startVM, setStartVM] = React.useState(true);
  const { vm, loaded: vmContextLoaded, error: vmContextError } = useWizardVMContext();
  const { createVM, loaded: vmCreateLoaded, error: vmCreateError } = useVmCreate();

  const onCreate = () =>
    createVM(vm, {
      namespace,
      startVM,
      onFullfilled: (createdVM) => {
        clearSessionStorageVM();
        history.push(getResourceUrl(VirtualMachineModel, createdVM));
      },
    });

  const loaded = vmContextLoaded && vmCreateLoaded;
  const error = vmContextError || vmCreateError;

  return (
    <footer className="vm-wizard-footer">
      <Stack hasGutter>
        <StackItem>
          <Checkbox
            id="start-after-create-checkbox"
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
        <Split hasGutter>
          <SplitItem>
            <Button
              isDisabled={!vm || !loaded}
              isLoading={!vmCreateLoaded}
              variant="primary"
              onClick={onCreate}
            >
              {t('Create VirtualMachine')}
            </Button>
          </SplitItem>
          {templateName && templateNamespace && (
            <SplitItem>
              <Button
                variant="secondary"
                onClick={() =>
                  history.push(
                    `/k8s/ns/${namespace}/templatescatalog/customize?name=${templateName}&namespace=${templateNamespace}`,
                  )
                }
              >
                {t('Back')}
              </Button>
            </SplitItem>
          )}
          <SplitItem>
            <Button
              variant="link"
              onClick={() => history.push(`/k8s/ns/${namespace}/templatescatalog`)}
            >
              {t('Cancel')}
            </Button>
          </SplitItem>
        </Split>
      </Stack>
    </footer>
  );
};
