import * as React from 'react';

import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

const TolerationModalDescriptionText: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <Content className="text-muted" component={ContentVariants.p}>
        {t(
          'Tolerations are applied to VirtualMachines, and allow (but do not require) the VirtualMachines to schedule onto Nodes with matching taints.',
        )}
      </Content>
      <Content className="text-muted" component={ContentVariants.p}>
        {t(
          'Add tolerations to allow a VirtualMachine to schedule onto Nodes with matching taints.',
        )}
      </Content>
      <Content
        component={ContentVariants.a}
        href={documentationURL.TAINTS_TOLERATION}
        target="_blank"
      >
        {t('Taints and Tolerations documentation')} <ExternalLinkAltIcon />
      </Content>
    </>
  );
};
export default TolerationModalDescriptionText;
