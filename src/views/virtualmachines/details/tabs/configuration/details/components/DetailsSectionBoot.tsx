import React, { FC, useState } from 'react';
import classNames from 'classnames';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import BootOrderSummary from '@kubevirt-utils/components/BootOrder/BootOrderSummary';
import BootOrderModal from '@kubevirt-utils/components/BootOrderModal/BootOrderModal';
import FirmwareBootloaderModal from '@kubevirt-utils/components/FirmwareBootloaderModal/FirmwareBootloaderModal';
import { getBootloaderTitleFromVM } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { ExpandableSection, Switch } from '@patternfly/react-core';

import { updateBootLoader, updatedBootOrder, updateStartStrategy } from '../utils/utils';

type DetailsSectionBootProps = {
  canUpdateVM: boolean;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const DetailsSectionBoot: FC<DetailsSectionBootProps> = ({ canUpdateVM, vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [isChecked, setIsChecked] = useState<boolean>(!!vm?.spec?.template?.spec?.startStrategy);
  const [isExpanded, setIsExpanded] = useState<boolean>();
  const vmName = getName(vm);

  return (
    <ExpandableSection
      isExpanded={isExpanded}
      isIndented
      onToggle={setIsExpanded}
      toggleText={t('Boot management')}
    >
      <VirtualMachineDescriptionItem
        descriptionData={
          <div className={classNames({ 'text-muted': !canUpdateVM })}>
            {getBootloaderTitleFromVM(vm)}
          </div>
        }
        onEditClick={() =>
          createModal(({ isOpen, onClose }) => (
            <FirmwareBootloaderModal
              isOpen={isOpen}
              onClose={onClose}
              onSubmit={updateBootLoader}
              vm={vm}
              vmi={vmi}
            />
          ))
        }
        className="DetailsSection-margin__bottom"
        data-test-id={`${vmName}-boot-method`}
        descriptionHeader={t('Boot mode')}
        isEdit={canUpdateVM}
      />
      <VirtualMachineDescriptionItem
        onEditClick={() =>
          createModal((props) => (
            <BootOrderModal {...props} onSubmit={updatedBootOrder} vm={vm} vmi={vmi} />
          ))
        }
        className="DetailsSection-margin__bottom"
        data-test-id={`${vmName}-boot-order`}
        descriptionData={<BootOrderSummary vm={vm} />}
        descriptionHeader={t('Boot order')}
        isEdit
      />
      <VirtualMachineDescriptionItem
        bodyContent={t(
          'Applying the start/pause mode to this Virtual Machine will cause it to partially reboot and pause.',
        )}
        descriptionData={
          <Switch
            onChange={(checked) => {
              setIsChecked(checked);
              updateStartStrategy(checked, vm);
            }}
            id="start-in-pause-mode"
            isChecked={isChecked}
          />
        }
        className="DetailsSection-margin__bottom"
        data-test-id="start-pause-mode"
        descriptionHeader={t('Start in pause mode')}
        isPopover
      />
    </ExpandableSection>
  );
};

export default DetailsSectionBoot;
