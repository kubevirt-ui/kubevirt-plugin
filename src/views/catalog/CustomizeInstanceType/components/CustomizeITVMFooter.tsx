import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { VirtualMachineModel } from '@kubevirt-ui/kubevirt-api/console';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { SecretSelectionOption } from '@kubevirt-utils/components/SSHSecretModal/utils/types';
import { RUNSTRATEGY_ALWAYS, RUNSTRATEGY_HALTED } from '@kubevirt-utils/constants/constants';
import { logITFlowEvent } from '@kubevirt-utils/extensions/telemetry/telemetry';
import {
  CANCEL_CUSTOMIZE_VM_BUTTON_CLICKED,
  CUSTOMIZE_VM_FAILED,
  CUSTOMIZE_VM_SUCCEEDED,
} from '@kubevirt-utils/extensions/telemetry/utils/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { createSSHSecret } from '@kubevirt-utils/resources/secret/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import {
  clearCustomizeInstanceType,
  updateCustomizeInstanceType,
  vmSignal,
} from '@kubevirt-utils/store/customizeInstanceType';
import { createHeadlessService } from '@kubevirt-utils/utils/headless-service';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { getCatalogURL, getVMURL } from '@multicluster/urls';
import {
  Button,
  ButtonVariant,
  Checkbox,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import './CustomizeITVMFooter.scss';

const CustomizeITVMFooter: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const namespace = useNamespaceParam();
  const cluster = useClusterParam();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<any | Error>(null);
  const { instanceTypeVMState, setStartVM, startVM, vm, vmNamespaceTarget } =
    useInstanceTypeVMStore();

  const [isUDNManagedNamespace] = useNamespaceUDN(namespace);
  const [authorizedSSHKeys, setAuthorizedSSHKeys] = useKubevirtUserSettings('ssh');
  const { sshSecretCredentials } = instanceTypeVMState;
  const { applyKeyToProject, secretOption, sshPubKey, sshSecretName } = sshSecretCredentials || {};

  return (
    <footer className="customize-it-vm-footer">
      <Stack hasGutter>
        <StackItem>
          <ErrorAlert error={error} />
        </StackItem>
        <StackItem>
          <Checkbox
            onChange={(_, checked: boolean) => {
              setStartVM(checked);
              updateCustomizeInstanceType([
                {
                  data: checked ? RUNSTRATEGY_ALWAYS : RUNSTRATEGY_HALTED,
                  path: 'spec.runStrategy',
                },
              ]);
            }}
            id="start-after-create-checkbox"
            isChecked={startVM}
            label={t('Start this VirtualMachine after creation')}
          />
        </StackItem>
        <StackItem />
        <div data-test-id="create-virtual-machine">
          <Split hasGutter>
            <SplitItem>
              <Button
                onClick={async () => {
                  if (
                    applyKeyToProject &&
                    !isEmpty(sshSecretName) &&
                    authorizedSSHKeys?.[vmNamespaceTarget] !== sshSecretName
                  ) {
                    setAuthorizedSSHKeys({
                      ...authorizedSSHKeys,
                      [vmNamespaceTarget]: sshSecretName,
                    });
                  }
                  setIsSubmitting(true);
                  setError(null);

                  try {
                    const createdVM = await kubevirtK8sCreate({
                      cluster,
                      data: vmSignal.value || vm,
                      model: VirtualMachineModel,
                    });
                    logITFlowEvent(CUSTOMIZE_VM_SUCCEEDED, createdVM);
                    if (secretOption === SecretSelectionOption.addNew) {
                      createSSHSecret(sshPubKey, sshSecretName, vmNamespaceTarget, cluster);
                    }
                    clearCustomizeInstanceType();

                    if (!isUDNManagedNamespace) createHeadlessService(createdVM);

                    navigate(getVMURL(cluster, vmNamespaceTarget, getName(createdVM)));
                  } catch (err) {
                    setError(err);
                    logITFlowEvent(CUSTOMIZE_VM_FAILED, vm);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                isLoading={isSubmitting}
                variant={ButtonVariant.primary}
              >
                {t('Create VirtualMachine')}
              </Button>
            </SplitItem>
            <SplitItem>
              <Button
                onClick={() => {
                  logITFlowEvent(CANCEL_CUSTOMIZE_VM_BUTTON_CLICKED, vm);
                  clearCustomizeInstanceType();
                  navigate(getCatalogURL(getCluster(vm), namespace));
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

export default CustomizeITVMFooter;
