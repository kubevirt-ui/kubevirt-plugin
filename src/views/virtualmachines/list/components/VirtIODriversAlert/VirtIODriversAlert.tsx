import React, { FC, useState } from 'react';
import { useLocation } from 'react-router';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { OS_NAME_LABELS } from '@kubevirt-utils/resources/template';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Button,
  Checkbox,
  Flex,
} from '@patternfly/react-core';
import { DOWNLOADS_TAB_IDS } from '@settings/search/constants';
import { createSettingsSearchURL } from '@settings/search/search';
import { SETTINGS_TABS } from '@settings/tabs';
import { getOSName } from '@virtualmachines/list/filters/getOSFilter';
import { VIRTIO_DRIVERS_ALERT_DISMISSED_KEY } from './constants';

type VirtIODriversAlertProps = {
  vms: V1VirtualMachine[];
};

const VirtIODriversAlert: FC<VirtIODriversAlertProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();
  const location = useLocation();

  const [permanentlyDismissed, setPermanentlyDismissed] = useLocalStorage<boolean>(
    VIRTIO_DRIVERS_ALERT_DISMISSED_KEY,
  );
  const [sessionDismissed, setSessionDismissed] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const hasWindowsVMs = vms?.some((vm) => getOSName(vm) === OS_NAME_LABELS.windows);

  if (!hasWindowsVMs || permanentlyDismissed || sessionDismissed) {
    return null;
  }

  const settingsURL = createSettingsSearchURL(
    SETTINGS_TABS.DOWNLOADS,
    DOWNLOADS_TAB_IDS.virtioDriversWindows,
    location.pathname,
  );

  const handleClose = () => {
    if (dontShowAgain) {
      setPermanentlyDismissed(true);
    }
    setSessionDismissed(true);
  };

  return (
    <Alert
      actionClose={<AlertActionCloseButton onClose={handleClose} />}
      className="pf-v6-u-mb-md"
      data-test="virtio-drivers-alert"
      isExpandable
      isInline
      title={t('Stay up to date with your VirtIO drivers')}
      variant={AlertVariant.warning}
    >
      <p className="pf-v6-u-mt-xs">
        {t(
          'The latest VirtIO-win version includes critical enhancements for Windows VMs. You can download the latest cluster-provided version from Virtualization > Settings > Downloads tab.',
        )}
      </p>
      <Flex className="pf-v6-u-mt-sm">
        <Button component="a" href={settingsURL} isInline variant="link">
          {t('Go to Downloads')}
        </Button>
        <ExternalLink
          href={documentationURL.VIRTIO_WIN_DRIVERS}
          text={t('How to update Windows VMs')}
        />
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
