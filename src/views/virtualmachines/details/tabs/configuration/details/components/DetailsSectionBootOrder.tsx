import { type FC, type JSX } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import BootOrderSummary from '@kubevirt-utils/components/BootOrder/BootOrderSummary';
import BootOrderModal from '@kubevirt-utils/components/BootOrderModal/BootOrderModal';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import {
  type ModalComponentProps,
  useModal,
} from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { getDisks, getInterfaces } from '@kubevirt-utils/resources/vm';
import { patchCustomizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';

import { updateBootOrder } from '../utils/utils';

type DetailsSectionBootOrderProps = {
  instanceTypeVM?: V1VirtualMachine;
  isCustomizeInstanceType?: boolean;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DetailsSectionBootOrder: FC<DetailsSectionBootOrderProps> = ({
  instanceTypeVM,
  isCustomizeInstanceType,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const vmName = getName(vm);

  const submitBootOrder = (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> => {
    if (isCustomizeInstanceType) {
      patchCustomizeWizardVMSignal([
        {
          data: getDisks(updatedVM),
          path: `spec.template.spec.domain.devices.disks`,
        },
        {
          data: getInterfaces(updatedVM),
          path: `.spec.template.spec.domain.devices.interfaces`,
        },
      ]);
      return Promise.resolve(updatedVM);
    }

    return updateBootOrder(updatedVM);
  };

  const onEditClick = (): void => {
    createModal(
      (props: ModalComponentProps): JSX.Element => (
        <BootOrderModal
          {...props}
          instanceTypeVM={instanceTypeVM}
          onSubmit={submitBootOrder}
          vm={vm}
          vmi={vmi}
        />
      ),
    );
  };

  return (
    <DescriptionItem
      className="pf-v6-u-mb-lg"
      data-test={`${vmName}-boot-order`}
      descriptionData={<BootOrderSummary instanceTypeVM={instanceTypeVM} vm={vm} />}
      descriptionHeader={<SearchItem id="boot-order">{t('Boot order')}</SearchItem>}
      isEdit
      onEditClick={onEditClick}
    />
  );
};

export default DetailsSectionBootOrder;
