import React from 'react';
import { Trans } from 'react-i18next';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCloudInitCredentials } from '@kubevirt-utils/resources/vmi';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  ClipboardCopy,
} from '@patternfly/react-core';

import { CLOUD_INIT_MISSING_USERNAME } from '../../utils/constants';

type CloudInitCredentialsProps = {
  vmi: V1VirtualMachineInstance;
};

const CloudInitCredentials: React.FC<CloudInitCredentialsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { user, password } = getCloudInitCredentials(vmi);
  const [showCredentials, setShowCredentials] = React.useState<boolean>(false);

  return (
    <Accordion>
      <AccordionItem>
        <AccordionToggle
          id="consoles-accordion-toggle"
          onClick={() => setShowCredentials(!showCredentials)}
          isExpanded={showCredentials}
        >
          {t('Guest login credentials')}
        </AccordionToggle>
        <AccordionContent isHidden={!showCredentials}>
          <Trans ns="plugin__kubevirt-plugin">
            The following credentials for this operating system were created via cloud-init. If
            unsuccessful, cloud-init could be improperly configured. Please contact the image
            provider for more information.
          </Trans>
          <div>
            <strong>{t('User name: ')}</strong>
            {user || CLOUD_INIT_MISSING_USERNAME}
            <strong>{t(' Password: ')} </strong>
            <ClipboardCopy variant="inline-compact" isCode>
              {password}
            </ClipboardCopy>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default CloudInitCredentials;
