import React, { FCC } from 'react';
import { Trans } from 'react-i18next';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';

const NetworkSelectHelperPopover: FCC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <HelpTextIcon
      bodyContent={(hide) => (
        <PopoverContentWithLightspeedButton
          content={
            <>
              <Trans t={t}>
                <div>
                  <b>Bridge binding</b>: Connects the VirtualMachine to the selected network, which
                  is ideal for L2 devices.
                </div>
                <div className="pf-v6-u-mb-sm">
                  <b>SR-IOV binding</b>: Attaches a virtual function network device to the
                  VirtualMachine for high performance.
                </div>
              </Trans>
              <ExternalLink href={documentationURL.VIRT_SECONDARY_NETWORK} text={t('Learn more')} />
            </>
          }
          hide={hide}
          promptType={OLSPromptType.NETWORKING_BINDING_TYPES}
        />
      )}
      headerContent={t('Network binding types')}
    />
  );
};
export default NetworkSelectHelperPopover;
