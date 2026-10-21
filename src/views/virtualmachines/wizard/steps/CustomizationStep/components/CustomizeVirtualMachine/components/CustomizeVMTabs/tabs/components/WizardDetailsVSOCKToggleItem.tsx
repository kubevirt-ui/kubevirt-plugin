import type { FC } from 'react';
import produce from 'immer';

import VSOCKDetailsDescriptionItem from '@kubevirt-utils/components/VSOCKDetailsDescriptionItem/VSOCKDetailsDescriptionItem';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';

const WizardDetailsVSOCKToggleItem: FC = () => {
  const { replaceDraft, vmDraft: vm } = useWizardVMDraft();

  if (!vm) {
    return null;
  }

  return (
    <VSOCKDetailsDescriptionItem
      updateVSOCK={(checked) =>
        Promise.resolve(
          replaceDraft(
            produce(vm, (draft) => {
              ensurePath(draft, 'spec.template.spec.domain.devices');
              draft.spec.template.spec.domain.devices.autoattachVSOCK = checked;
            }),
            vm,
          ),
        )
      }
      vm={vm}
    />
  );
};

export default WizardDetailsVSOCKToggleItem;
