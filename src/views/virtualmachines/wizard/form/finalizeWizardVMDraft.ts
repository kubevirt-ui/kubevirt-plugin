import produce from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm/utils/annotations';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

import { type VMWizardDeploymentValues } from './types';

export const finalizeWizardVMDraft = (
  vmDraft: V1VirtualMachine,
  deployment: VMWizardDeploymentValues,
): V1VirtualMachine =>
  produce(vmDraft, (draft) => {
    ensurePath(draft, 'metadata');

    if (deployment.name) draft.metadata.name = deployment.name;
    if (deployment.project) draft.metadata.namespace = deployment.project;

    if (deployment.cluster) {
      draft.cluster = deployment.cluster;
    }

    if (deployment.description) {
      ensurePath(draft, 'metadata.annotations');

      draft.metadata.annotations[DESCRIPTION_ANNOTATION] = deployment.description;
    }

    if (deployment.folder) {
      ensurePath(draft, 'metadata.labels');

      draft.metadata.labels[VM_FOLDER_LABEL] = deployment.folder;
    }
  });
