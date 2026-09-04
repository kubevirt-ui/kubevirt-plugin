import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  customizeWizardVMSignal,
  setCustomizeWizardVMSignal,
} from '@kubevirt-utils/signals/customizeWizardVMSignal';

import { reconcileGeneratedVM } from './reconcileGeneratedVM/reconcileGeneratedVM';

let generatedVMDraftBaseline: null | V1VirtualMachine = null;
let generatedVMDraftRevision = 0;

export const beginGeneratedVMDraftRequest = (): number => {
  generatedVMDraftRevision += 1;
  return generatedVMDraftRevision;
};

export const discardGeneratedVMDraft = (): void => {
  generatedVMDraftBaseline = null;
  generatedVMDraftRevision += 1;
  setCustomizeWizardVMSignal(null);
};

export const getGeneratedVMDraftRevision = (): number => generatedVMDraftRevision;

export const markGeneratedVMDraftStale = (): void => {
  generatedVMDraftRevision += 1;
};

export const publishGeneratedVMDraft = (nextGeneratedVM: V1VirtualMachine): V1VirtualMachine => {
  const currentCustomizedVM = customizeWizardVMSignal.value;
  const nextVMDraft =
    generatedVMDraftBaseline && currentCustomizedVM
      ? reconcileGeneratedVM(generatedVMDraftBaseline, currentCustomizedVM, nextGeneratedVM)
      : nextGeneratedVM;

  generatedVMDraftBaseline = nextGeneratedVM;
  setCustomizeWizardVMSignal(nextVMDraft);

  return nextVMDraft;
};
