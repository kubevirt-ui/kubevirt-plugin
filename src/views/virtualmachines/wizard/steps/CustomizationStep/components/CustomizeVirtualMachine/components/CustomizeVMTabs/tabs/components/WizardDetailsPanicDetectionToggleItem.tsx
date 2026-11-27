import type { FC } from 'react';
import produce from 'immer';

import PanicDeviceDescriptionItem from '@kubevirt-utils/components/PanicDeviceDescriptionItem/PanicDeviceDescriptionItem';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';

const WizardDetailsPanicDetectionToggleItem: FC = () => {
  const { replaceDraft, vmDraft: vm } = useWizardVMDraft();

  if (!vm) {
    return null;
  }

  return (
    <PanicDeviceDescriptionItem
      updatePanicDetection={(checked, panicDeviceModel) =>
        Promise.resolve(
          replaceDraft(
            produce(vm, (draft) => {
              ensurePath(draft, 'spec.template.spec.domain.devices');
              if (checked) {
                draft.spec.template.spec.domain.devices.panicDevices = [
                  { model: panicDeviceModel },
                ];
              } else {
                delete draft.spec.template.spec.domain.devices.panicDevices;
              }
            }),
            vm,
          ),
        )
      }
      vm={vm}
    />
  );
};

export default WizardDetailsPanicDetectionToggleItem;
