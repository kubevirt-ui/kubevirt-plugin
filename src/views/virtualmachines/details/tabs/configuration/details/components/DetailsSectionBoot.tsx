import React, { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';
import classNames from 'classnames';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import BootOrderSummary from '@kubevirt-utils/components/BootOrder/BootOrderSummary';
import BootOrderModal from '@kubevirt-utils/components/BootOrderModal/BootOrderModal';
import FirmwareBootloaderModal from '@kubevirt-utils/components/FirmwareBootloaderModal/FirmwareBootloaderModal';
import { getBootloaderTitleFromVM } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useToggle } from '@kubevirt-utils/hooks/useToggle';
import { getName } from '@kubevirt-utils/resources/shared';
import { getDisks, getInterfaces } from '@kubevirt-utils/resources/vm';
import { updateCustomizeInstanceType } from '@kubevirt-utils/store/customizeInstanceType';
import { ExpandableSection, Switch } from '@patternfly/react-core';
import { printableVMStatus } from '@virtualmachines/utils';

import { getSearchItemsIds } from '../../search/utils/utils';
import { expandURLHash, getDetailsTabBootIds } from '../../utils/search';
import { updateBootLoader, updatedBootOrder, updateStartStrategy } from '../utils/utils';

type DetailsSectionBootProps = {
  canUpdateVM: boolean;
  instanceTypeVM?: V1VirtualMachine;
  isCustomizeInstanceType?: boolean;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DetailsSectionBoot: FC<DetailsSectionBootProps> = ({
  canUpdateVM,
  instanceTypeVM,
  isCustomizeInstanceType,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const location = useLocation();
  const [isChecked, setIsChecked] = useState<boolean>(!!vm?.spec?.template?.spec?.startStrategy);
  const [isExpanded, setIsExpanded] = useToggle('boot-management');
  const vmName = getName(vm);

  useEffect(() => {
    expandURLHash(getSearchItemsIds(getDetailsTabBootIds(vm)), location?.hash, setIsExpanded);
  }, [vm, location?.hash]);

  return (
    <ExpandableSection
      isExpanded={isExpanded}
      isIndented
      onToggle={(_event, val) => setIsExpanded(val)}
      toggleContent={<SearchItem id="boot-management">{t('Boot management')}</SearchItem>}
    >
      <VirtualMachineDescriptionItem
        descriptionData={
          <div className={classNames({ 'text-muted': !canUpdateVM })}>
            {getBootloaderTitleFromVM(instanceTypeVM || vm)}
          </div>
        }
        onEditClick={() =>
          createModal(({ isOpen, onClose }) => (
            <FirmwareBootloaderModal
              onSubmit={(updatedVM) =>
                isCustomizeInstanceType
                  ? Promise.resolve(updateCustomizeInstanceType([{ data: updatedVM }]))
                  : updateBootLoader(updatedVM, vm)
              }
              isOpen={isOpen}
              onClose={onClose}
              vm={instanceTypeVM || vm}
              vmi={vmi}
            />
          ))
        }
        className="DetailsSection-margin__bottom"
        data-test-id={`${vmName}-boot-method`}
        descriptionHeader={<SearchItem id="boot-mode">{t('Boot mode')}</SearchItem>}
        isEdit={canUpdateVM}
      />
      <VirtualMachineDescriptionItem
        onEditClick={() =>
          createModal((props) => (
            <BootOrderModal
              {...props}
              onSubmit={(updatedVM: V1VirtualMachine) =>
                isCustomizeInstanceType
                  ? Promise.resolve(
                      updateCustomizeInstanceType([
                        {
                          data: getDisks(updatedVM),
                          path: `spec.template.spec.domain.devices.disks`,
                        },
                        {
                          data: getInterfaces(updatedVM),
                          path: `.spec.template.spec.domain.devices.interfaces`,
                        },
                      ]),
                    )
                  : updatedBootOrder(updatedVM)
              }
              vm={vm}
              vmi={vmi}
            />
          ))
        }
        className="DetailsSection-margin__bottom"
        data-test-id={`${vmName}-boot-order`}
        descriptionData={<BootOrderSummary vm={vm} />}
        descriptionHeader={<SearchItem id="boot-order">{t('Boot order')}</SearchItem>}
        isEdit
      />
      <VirtualMachineDescriptionItem
        bodyContent={t(
          'Applying the start/pause mode to this Virtual Machine will cause it to partially reboot and pause.',
        )}
        descriptionData={
          <Switch
            onChange={(_event, checked) => {
              setIsChecked(checked);
              isCustomizeInstanceType
                ? Promise.resolve(
                    updateCustomizeInstanceType([
                      {
                        data: checked ? printableVMStatus.Paused : null,
                        path: `spec.template.spec.startStrategy`,
                      },
                    ]),
                  )
                : updateStartStrategy(checked, vm);
            }}
            id="start-in-pause-mode"
            isChecked={isChecked}
          />
        }
        descriptionHeader={
          <SearchItem id="start-pause-mode">{t('Start in pause mode')}</SearchItem>
        }
        className="DetailsSection-margin__bottom"
        data-test-id="start-pause-mode"
        isPopover
      />
    </ExpandableSection>
  );
};

export default DetailsSectionBoot;
