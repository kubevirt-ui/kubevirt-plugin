import { useState } from 'react';
import produce from 'immer';

import { V1Devices, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { addUploadDataVolumeOwnerReference } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import {
  HEADLESS_SERVICE_LABEL,
  HEADLESS_SERVICE_NAME,
} from '@kubevirt-utils/utils/headless-service';
import { K8sResourceCommon, useK8sModels } from '@openshift-console/dynamic-plugin-sdk';

import { getLabels } from '../../clusteroverview/OverviewTab/inventory-card/utils/flattenTemplates';

import { createMultipleResources } from './utils';
import { useWizardVMContext } from './WizardVMContext';

type CreateVMArguments = {
  isDisableGuestSystemAccessLog: boolean;
  onFullfilled: (vm: V1VirtualMachine) => void;
};

type UseWizardVmCreateValues = {
  createVM: ({ isDisableGuestSystemAccessLog, onFullfilled }: CreateVMArguments) => Promise<void>;
  error: any;
  loaded: boolean;
};

export const useWizardVmCreate = (): UseWizardVmCreateValues => {
  const { tabsData, vm } = useWizardVMContext();
  const [models] = useK8sModels();
  const [authorizedSSHKeys, updateAuthorizedSSHKeys] = useKubevirtUserSettings('ssh');

  const [loaded, setLoaded] = useState<boolean>(true);
  const [error, setError] = useState<any>();

  const createVM = async ({ isDisableGuestSystemAccessLog, onFullfilled }: CreateVMArguments) => {
    try {
      setLoaded(false);
      setError(undefined);

      const vmToCrete = produce(vm, (vmDraft) => {
        if (isDisableGuestSystemAccessLog) {
          const devices = (<unknown>vmDraft.spec.template.spec.domain.devices) as V1Devices & {
            logSerialConsole: boolean;
          };
          devices.logSerialConsole = false;
          vmDraft.spec.template.spec.domain.devices = devices;
        }

        if (!getLabels(vmDraft.spec.template)) vmDraft.spec.template.metadata.labels = {};
        vmDraft.spec.template.metadata.labels[HEADLESS_SERVICE_LABEL] = HEADLESS_SERVICE_NAME;
      });

      const createdObjects = await createMultipleResources(
        [vmToCrete, ...(tabsData?.additionalObjects as [] | K8sResourceCommon[])],
        models,
        vmToCrete.metadata.namespace,
      );

      const newVM = createdObjects[0] as V1VirtualMachine;

      // add missing ownerReferences to upload data volumes
      if (tabsData?.disks?.dataVolumesToAddOwnerRef?.length > 0) {
        await Promise.all(
          tabsData?.disks?.dataVolumesToAddOwnerRef.map((dv) =>
            addUploadDataVolumeOwnerReference(newVM, dv),
          ),
        );
      }

      if (tabsData.authorizedSSHKey && tabsData.applySSHToSettings) {
        updateAuthorizedSSHKeys({
          ...authorizedSSHKeys,
          [newVM.metadata.namespace]: tabsData.authorizedSSHKey,
        });
      }

      setLoaded(true);
      onFullfilled(newVM);
    } catch (e) {
      setLoaded(true);
      setError(e);
    }
  };

  return {
    createVM,
    error,
    loaded,
  };
};
