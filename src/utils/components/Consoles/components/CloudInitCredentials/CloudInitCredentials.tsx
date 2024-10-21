import React, { FC, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
} from '@patternfly/react-core';

import CloudInitCredentialsContent from './CloudInitCredentialsContent';

import './cloud-init-credentials.scss';

type CloudInitCredentialsProps = {
  isStandAlone?: boolean;
  vm: V1VirtualMachine;
};

const CloudInitCredentials: FC<CloudInitCredentialsProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const [showCredentials, setShowCredentials] = useState<boolean>(false);

  return (
    <Accordion className="cloud-init-credentials">
      <AccordionItem>
        <AccordionToggle
          id="consoles-accordion-toggle"
          isExpanded={showCredentials}
          onClick={() => setShowCredentials(!showCredentials)}
        >
          {t('Guest login credentials')}
        </AccordionToggle>
        <AccordionContent isHidden={!showCredentials}>
          <CloudInitCredentialsContent vm={vm} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default CloudInitCredentials;
