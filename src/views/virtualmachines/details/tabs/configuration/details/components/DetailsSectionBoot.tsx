import { type FC, type JSX, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import classNames from 'classnames';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import FirmwareBootloaderModal from '@kubevirt-utils/components/FirmwareBootloaderModal/FirmwareBootloaderModal';
import { type BootMode } from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/constants';
import {
  getBootloaderTitleFromVM,
  getClusterOnlyArchitecture,
} from '@kubevirt-utils/components/FirmwareBootloaderModal/utils/utils';
import {
  type ModalComponentProps,
  useModal,
} from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import useHcoWorkloadArchitectures from '@kubevirt-utils/hooks/useHcoWorkloadArchitectures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useToggle } from '@kubevirt-utils/hooks/useToggle';
import { getName } from '@kubevirt-utils/resources/shared';
import { patchCustomizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { getCluster } from '@multicluster/helpers/selectors';
import { ExpandableSection, Switch } from '@patternfly/react-core';
import { printableVMStatus } from '@virtualmachines/utils';

import { getSearchItemsIds } from '../../search/utils/utils';
import { expandURLHash, getDetailsTabBootIds } from '../../utils/search';
import { updateBootLoader, updateStartStrategy } from '../utils/utils';
import DetailsSectionBootOrder from './DetailsSectionBootOrder';

type DetailsSectionBootProps = {
  canUpdateVM: boolean;
  instanceTypeVM?: V1VirtualMachine;
  isCustomizeInstanceType?: boolean;
  preferredBootmode?: BootMode;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const DetailsSectionBoot: FC<DetailsSectionBootProps> = ({
  canUpdateVM,
  instanceTypeVM,
  isCustomizeInstanceType,
  preferredBootmode,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const location = useLocation();
  const [isChecked, setIsChecked] = useState<boolean>(!!vm?.spec?.template?.spec?.startStrategy);
  const [isExpanded, setIsExpanded] = useToggle('boot-management');
  const vmName = getName(vm);
  const [clusterWorkloadArchitectures] = useHcoWorkloadArchitectures(getCluster(vm));
  const clusterOnlyArchitecture = getClusterOnlyArchitecture(clusterWorkloadArchitectures);

  useEffect((): void => {
    expandURLHash(getSearchItemsIds(getDetailsTabBootIds(vm)), location?.hash, setIsExpanded);
  }, [vm, location?.hash, setIsExpanded]);

  const firmwareVM = instanceTypeVM ?? vm;

  const onBootModeEdit = (): void => {
    createModal(
      ({ isOpen, onClose }: ModalComponentProps): JSX.Element => (
        <FirmwareBootloaderModal
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={(updatedVM: V1VirtualMachine): Promise<V1VirtualMachine | void> =>
            isCustomizeInstanceType
              ? Promise.resolve(patchCustomizeWizardVMSignal([{ data: updatedVM }]))
              : updateBootLoader(updatedVM, vm)
          }
          preferredBootmode={preferredBootmode}
          vm={firmwareVM}
          vmi={vmi}
        />
      ),
    );
  };

  const onStartStrategyChange = (_event: unknown, checked: boolean): void => {
    setIsChecked(checked);
    const patchPromise = isCustomizeInstanceType
      ? Promise.resolve(
          patchCustomizeWizardVMSignal([
            {
              data: checked ? printableVMStatus.Paused : null,
              path: `spec.template.spec.startStrategy`,
            },
          ]),
        )
      : Promise.resolve(updateStartStrategy(checked, vm));
    patchPromise.catch(kubevirtConsole.error);
  };

  return (
    <ExpandableSection
      isExpanded={isExpanded}
      isIndented
      onToggle={(_event, val): void => setIsExpanded(val)}
      toggleContent={<SearchItem id="boot-management">{t('Boot management')}</SearchItem>}
    >
      <DescriptionItem
        className="pf-v6-u-mb-lg"
        data-test={`${vmName}-boot-method`}
        descriptionData={
          <div className={classNames({ 'pf-v6-u-text-color-subtle': !canUpdateVM })}>
            {getBootloaderTitleFromVM(firmwareVM, t, preferredBootmode, clusterOnlyArchitecture)}
          </div>
        }
        descriptionHeader={<SearchItem id="boot-mode">{t('Boot mode')}</SearchItem>}
        isEdit={canUpdateVM}
        onEditClick={onBootModeEdit}
      />
      <DetailsSectionBootOrder
        instanceTypeVM={instanceTypeVM}
        isCustomizeInstanceType={isCustomizeInstanceType}
        vm={vm}
        vmi={vmi}
      />
      <DescriptionItem
        bodyContent={t(
          'Applying the start/pause mode to this virtual machine will cause it to partially reboot and pause.',
        )}
        className="pf-v6-u-mb-lg"
        descriptionData={
          <Switch id="start-in-pause-mode" isChecked={isChecked} onChange={onStartStrategyChange} />
        }
        descriptionHeader={
          <SearchItem id="start-pause-mode">{t('Start in pause mode')}</SearchItem>
        }
        isPopover
        olsObj={vm}
        promptType={OLSPromptType.START_IN_PAUSE_MODE}
      />
    </ExpandableSection>
  );
};

export default DetailsSectionBoot;
