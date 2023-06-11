import React from 'react';

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
  vm: V1VirtualMachine;
};

const CloudInitCredentials: React.FC<CloudInitCredentialsProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const [showCredentials, setShowCredentials] = React.useState<boolean>(false);

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
