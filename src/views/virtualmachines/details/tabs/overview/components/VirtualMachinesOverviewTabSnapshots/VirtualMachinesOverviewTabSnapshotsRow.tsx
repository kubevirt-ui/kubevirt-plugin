import React, { FC, useState } from 'react';

import {
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import RestoreModal from '@kubevirt-utils/components/SnapshotModal/RestoreModal';
import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import KebabToggle from '@kubevirt-utils/components/toggles/KebabToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionList,
  DescriptionListTermHelpTextButton,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  Icon,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';

import { printableVMStatus } from '../../../../../utils';
import IndicationLabelList from '../../../snapshots/components/IndicationLabel/IndicationLabelList';

import SnapshotDeleteModal from './component/SnapshotDeleteModal';
import { icon } from './utils/snapshotStatus';

type VirtualMachinesOverviewTabSnapshotsRowProps = {
  snapshot: V1beta1VirtualMachineSnapshot;
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabSnapshotsRow: FC<VirtualMachinesOverviewTabSnapshotsRowProps> = ({
  snapshot,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const [isKebabOpen, setIsKebabOpen] = useState(false);
  const { createModal } = useModal();

  const timestamp = timestampFor(
    new Date(snapshot?.metadata?.creationTimestamp),
    new Date(Date.now()),
    false,
  );

  const StatusIcon = icon[snapshot?.status?.phase];

  const onToggle = () => setIsKebabOpen((prevIsOpen) => !prevIsOpen);

  return (
    <Flex flexWrap={{ default: 'nowrap' }}>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        flexWrap={{ default: 'nowrap' }}
        grow={{ default: 'grow' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        <Icon>
          <StatusIcon />
        </Icon>
        <DescriptionList>
          <Popover
            bodyContent={
              <DescriptionList isHorizontal>
                <DescriptionItem
                  descriptionData={
                    <>
                      <StatusIcon />
                      <span className="pf-v6-u-ml-xs">{snapshot?.status?.phase}</span>
                    </>
                  }
                  descriptionHeader={t('Status')}
                />
                <DescriptionItem descriptionData={timestamp} descriptionHeader={t('Created')} />
                <DescriptionItem
                  descriptionData={<IndicationLabelList snapshot={snapshot} />}
                  descriptionHeader={t('Indications')}
                />
              </DescriptionList>
            }
            headerContent={snapshot?.metadata?.name}
            position={PopoverPosition.left}
          >
            <DescriptionListTermHelpTextButton>
              {snapshot?.metadata?.name}
            </DescriptionListTermHelpTextButton>
          </Popover>
        </DescriptionList>
        <span className="pf-v6-u-text-color-subtle">{`(${timestamp})`}</span>
      </Flex>
      <Dropdown
        isOpen={isKebabOpen}
        onOpenChange={setIsKebabOpen}
        onSelect={() => setIsKebabOpen(false)}
        popperProps={{ position: 'right' }}
        toggle={KebabToggle({ isExpanded: isKebabOpen, onClick: onToggle })}
      >
        <DropdownList>
          <DropdownItem
            isDisabled={vm?.status?.printableStatus !== printableVMStatus.Stopped}
            key="restore"
            onClick={() => createModal((props) => <RestoreModal snapshot={snapshot} {...props} />)}
          >
            {t('Restore')}
          </DropdownItem>
          <DropdownItem
            onClick={() =>
              createModal((props) => <SnapshotDeleteModal snapshot={snapshot} {...props} />)
            }
            key="delete"
          >
            {t('Delete')}
          </DropdownItem>
        </DropdownList>
      </Dropdown>
    </Flex>
  );
};

export default VirtualMachinesOverviewTabSnapshotsRow;
