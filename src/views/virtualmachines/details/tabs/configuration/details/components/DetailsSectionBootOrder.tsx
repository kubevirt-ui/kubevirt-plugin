import { type FC, type JSX } from 'react';
import produce from 'immer';

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

import { updateBootOrder } from '../utils/utils';

type DetailsSectionBootOrderProps = {
  canUpdateVM?: boolean;

  getCurrentVM?: () => null | undefined | V1VirtualMachine;
  instanceTypeVM?: V1VirtualMachine;
  onUpdateVM?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | undefined>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DetailsSectionBootOrder: FC<DetailsSectionBootOrderProps> = ({
  canUpdateVM = true,
  getCurrentVM,
  instanceTypeVM,
  onUpdateVM,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const vmName = getName(vm);

  const submitBootOrder = (updatedVM: V1VirtualMachine): Promise<V1VirtualMachine> => {
    if (onUpdateVM) {
      const currentVM = getCurrentVM?.() ?? vm;
      const nextVM = produce(currentVM, (draft) => {
        // Apply ordering only to devices that still exist in the current draft.
        const devices = draft.spec?.template?.spec?.domain?.devices;
        const updatedDevices = updatedVM.spec?.template?.spec?.domain?.devices;
        for (const kind of ['disks', 'interfaces'] as const) {
          for (const device of devices?.[kind] ?? []) {
            const updated = updatedDevices?.[kind]?.find(({ name }) => name === device.name);
            if (updated) {
              device.bootOrder = updated.bootOrder;
            }
          }
        }
      });
      return onUpdateVM(nextVM).then((result) => result ?? nextVM);
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
      isEdit={canUpdateVM}
      onEditClick={onEditClick}
    />
  );
};

export default DetailsSectionBootOrder;
