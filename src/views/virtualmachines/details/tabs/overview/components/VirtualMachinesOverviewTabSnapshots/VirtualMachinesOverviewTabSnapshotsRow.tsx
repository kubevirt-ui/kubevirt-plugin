import * as React from 'react';

import {
  V1alpha1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListTerm,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Dropdown,
  DropdownItem,
  KebabToggle,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';

import { printableVMStatus } from '../../../../../utils';
import IndicationLabelList from '../../../snapshots/components/IndicationLabel/IndicationLabelList';
import RestoreModal from '../../../snapshots/components/modal/RestoreModal';

import SnapshotDeleteModal from './component/SnapshotDeleteModal';
import { icon } from './utils/snapshotStatus';

import './virtual-machines-overview-tab-snapshots.scss';

type VirtualMachinesOverviewTabSnapshotsRowProps = {
  snapshot: V1alpha1VirtualMachineSnapshot;
  vm: V1VirtualMachine;
};

const VirtualMachinesOverviewTabSnapshotsRow: React.FC<
  VirtualMachinesOverviewTabSnapshotsRowProps
> = ({ snapshot, vm }) => {
  const { t } = useKubevirtTranslation();
  const [isKebabOpen, setIsKebabOpen] = React.useState(false);
  const { createModal } = useModal();

  const dropdownItems = [
    <DropdownItem
      isDisabled={vm?.status?.printableStatus !== printableVMStatus.Stopped}
      key="restore"
      onClick={() => createModal((props) => <RestoreModal snapshot={snapshot} {...props} />)}
    >
      {t('Restore')}
    </DropdownItem>,
    <DropdownItem
      key="delete"
      onClick={() => createModal((props) => <SnapshotDeleteModal snapshot={snapshot} {...props} />)}
    >
      {t('Delete')}
    </DropdownItem>,
  ];

  const timestamp = timestampFor(
    new Date(snapshot?.metadata?.creationTimestamp),
    new Date(Date.now()),
    false,
  );

  const Icon = icon[snapshot?.status?.phase];

  return (
    <div className="VirtualMachinesOverviewTabSnapshotsRow--main">
      <div className="name">
        <Icon />
        <DescriptionListTermHelpText>
          <Popover
            bodyContent={
              <DescriptionList columnModifier={{ default: '2Col' }} isHorizontal>
                <DescriptionListTerm>{t('Status')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <Icon />
                  <span className="icon-spacer">{snapshot?.status?.phase}</span>
                </DescriptionListDescription>
                <DescriptionListTerm>{t('Created')}</DescriptionListTerm>
                <DescriptionListDescription>{timestamp}</DescriptionListDescription>
                <DescriptionListTerm>{t('Indications')}</DescriptionListTerm>
                <DescriptionListDescription>
                  <IndicationLabelList snapshot={snapshot} />
                </DescriptionListDescription>
              </DescriptionList>
            }
            headerContent={snapshot?.metadata?.name}
            position={PopoverPosition.left}
          >
            <DescriptionListTermHelpTextButton className="icon-spacer__offset">
              {snapshot?.metadata?.name}
            </DescriptionListTermHelpTextButton>
          </Popover>
        </DescriptionListTermHelpText>
        <span className="text-muted timestamp">{`(${timestamp})`}</span>
      </div>
      <Dropdown
        dropdownItems={dropdownItems}
        isOpen={isKebabOpen}
        isPlain
        onSelect={() => setIsKebabOpen(false)}
        position="right"
        toggle={<KebabToggle onToggle={(isOpen) => setIsKebabOpen(isOpen)} />}
      />
    </div>
  );
};

export default VirtualMachinesOverviewTabSnapshotsRow;
