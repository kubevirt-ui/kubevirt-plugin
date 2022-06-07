import React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
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
  vmi: V1VirtualMachineInstance;
};

const CloudInitCredentials: React.FC<CloudInitCredentialsProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const [showCredentials, setShowCredentials] = React.useState<boolean>(false);

  return (
    <Accordion className="cloud-init-credentials">
      <AccordionItem>
        <AccordionToggle
          id="consoles-accordion-toggle"
          onClick={() => setShowCredentials(!showCredentials)}
          isExpanded={showCredentials}
        >
          {t('Guest login credentials')}
        </AccordionToggle>
        <AccordionContent isHidden={!showCredentials}>
          <CloudInitCredentialsContent vmi={vmi} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default CloudInitCredentials;
