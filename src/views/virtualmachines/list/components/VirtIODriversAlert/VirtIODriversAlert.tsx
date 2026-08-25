import React, { FC, useState } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useLastNamespacePath } from '@kubevirt-utils/hooks/useLastNamespacePath';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { OS_NAME_LABELS } from '@kubevirt-utils/resources/template';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
  Checkbox,
  Flex,
} from '@patternfly/react-core';
import { getOSName } from '@virtualmachines/list/utils/filters/getOSFilter';
import { VIRTUALIZATION_PATHS } from '@virtualmachines/tree/utils/constants';

import { VIRTIO_DRIVERS_ALERT_DISMISSED_KEY } from './constants';

type VirtIODriversAlertProps = {
  vms: V1VirtualMachine[];
};

const VirtIODriversAlert: FC<VirtIODriversAlertProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();
  const [permanentlyDismissed, setPermanentlyDismissed] = useLocalStorage<boolean>(
    VIRTIO_DRIVERS_ALERT_DISMISSED_KEY,
  );
  const [sessionDismissed, setSessionDismissed] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const lastNamespacePath = useLastNamespacePath();

  const hasWindowsVMs = vms?.some((vm) => getOSName(vm) === OS_NAME_LABELS.windows);

  if (!hasWindowsVMs || permanentlyDismissed || sessionDismissed) {
    return null;
  }

  const settingsURL = `/k8s/${lastNamespacePath}/${VIRTUALIZATION_PATHS.SETTINGS}`;

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
          'The latest version of VirtIO drivers includes critical enhancements for Windows VMs. You can download the latest cluster-provided version from Virtualization > Overview > Settings > Downloads tab.',
        )}
      </p>
      <Flex className="pf-v6-u-mt-sm">
        <Link to={settingsURL}>{t('Go to Settings')}</Link>
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
