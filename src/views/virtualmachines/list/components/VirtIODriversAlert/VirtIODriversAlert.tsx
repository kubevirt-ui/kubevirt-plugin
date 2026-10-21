import { type FC, useCallback, useState } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { OS_NAME_LABELS } from '@kubevirt-utils/resources/template';
import { getOSLabel } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import useVirtIODriversAlert from '@kubevirt-utils/resources/vm/utils/virtio-drivers/useVirtIODriversAlert';
import { getOutdatedDriversAlertTitle } from '@kubevirt-utils/resources/vm/utils/virtio-drivers/utils';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Button,
  Checkbox,
  Flex,
} from '@patternfly/react-core';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils/constants';

import VirtIODownloadsSettingsLink from './components/VirtIODownloadsSettingsLink';
import VirtIODriversDocLink from './components/VirtIODriversDocLink';
import { VIRTIO_DRIVERS_ALERT_DISMISSED_KEY } from './constants';

type VirtIODriversAlertProps = {
  clearAllFiltersWithReset: () => void;
  handleSetFilters: (newFilters: Partial<KubevirtFilterState>) => void;
  vms: V1VirtualMachine[];
};

const VirtIODriversAlert: FC<VirtIODriversAlertProps> = ({
  clearAllFiltersWithReset,
  handleSetFilters,
  vms,
}) => {
  const { t } = useKubevirtTranslation();

  const [permanentlyDismissed, setPermanentlyDismissed] = useLocalStorage<boolean>(
    VIRTIO_DRIVERS_ALERT_DISMISSED_KEY,
  );
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const { setSessionDismissed, showAlert, showBackupAlert, vmsCount } = useVirtIODriversAlert();

  const handleClose = (): void => {
    if (dontShowAgain) {
      setPermanentlyDismissed(true);
    }
    setSessionDismissed(true);
  };

  const handleViewOutdatedDrivers = useCallback((): void => {
    clearAllFiltersWithReset();
    handleSetFilters({
      [VirtualMachineRowFilterType.OutdatedVirtioDrivers]: ['true'],
    });
  }, [clearAllFiltersWithReset, handleSetFilters]);

  if (permanentlyDismissed || (!showAlert && !showBackupAlert)) {
    return null;
  }

  const hasWindowsVM = vms?.some((vm) => getOSLabel(vm) === OS_NAME_LABELS.windows);
  if (showBackupAlert && !hasWindowsVM) {
    return null;
  }

  return (
    <Alert
      actionClose={<AlertActionCloseButton onClose={handleClose} />}
      className="pf-v6-u-mb-md"
      data-test="virtio-drivers-alert"
      isExpandable
      isInline
      title={
        showBackupAlert
          ? t('Stay up to date with your VirtIO drivers')
          : getOutdatedDriversAlertTitle(vmsCount, t)
      }
      variant={AlertVariant.warning}
    >
      <p className="pf-v6-u-mt-xs">
        {showBackupAlert
          ? t(
              'The latest version of VirtIO drivers includes critical enhancements for Windows VMs. You can download the latest cluster-provided version from Virtualization > Settings > Downloads tab.',
            )
          : t(
              'Running older driver versions might cause instability after platform upgrades. Update the {{vmsCount}} VMs to the latest VirtIO drivers to ensure cluster compatibility.',
              { vmsCount },
            )}
      </p>
      <Flex className="pf-v6-u-mt-sm">
        {showAlert && (
          <Button isInline onClick={handleViewOutdatedDrivers} variant="link">
            {t('View VMs with outdated drivers')}
          </Button>
        )}
        <VirtIODownloadsSettingsLink />
        <VirtIODriversDocLink />
      </Flex>
      <Checkbox
        className="pf-v6-u-mt-md"
        data-test="virtio-drivers-dont-show-again"
        id="virtio-drivers-dont-show-again"
        isChecked={dontShowAgain}
        label={t("Don't show this message again")}
        onChange={(_event, checked) => setDontShowAgain(checked)}
      />
    </Alert>
  );
};

export default VirtIODriversAlert;
