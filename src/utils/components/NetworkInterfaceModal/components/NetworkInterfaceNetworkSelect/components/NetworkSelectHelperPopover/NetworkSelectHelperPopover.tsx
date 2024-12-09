import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';
import styles from '@patternfly/react-styles/css/components/Form/form';

import './NetworkSelectHelperPopover.scss';

const NetworkSelectHelperPopover: FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <Popover
      bodyContent={
        <>
          <Trans t={t}>
            <div>
              <b>Bridge binding</b>: Connects the VirtualMachine to the selected network, which is
              ideal for L2 devices.
            </div>
            <div className="NetworkSelectPopoverSriovLabel">
              <b>SR-IOV binding</b>: Attaches a virtual function network device to the
              VirtualMachine for high performance.
            </div>
          </Trans>
          <ExternalLink href={documentationURL.VIRT_SECONDARY_NETWORK} text={t('Learn more')} />
        </>
      }
      headerContent={t('Network binding types')}
    >
      <Button className={styles.formGroupLabelHelp} variant={ButtonVariant.plain}>
        <HelpIcon />
      </Button>
    </Popover>
  );
};
export default NetworkSelectHelperPopover;
