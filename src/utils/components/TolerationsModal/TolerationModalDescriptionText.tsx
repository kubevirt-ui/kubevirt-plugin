import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Text, TextVariants } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

const TolerationModalDescriptionText: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <Text className="text-muted" component={TextVariants.p}>
        {t(
          'Tolerations are applied to VMs, and allow (but do not require) the VMs to schedule onto Nodes with matching taints.',
        )}
      </Text>
      <Text className="text-muted" component={TextVariants.p}>
        {t('Add tolerations to allow a VM to schedule onto Nodes with matching taints.')}
      </Text>
      <Text
        component={TextVariants.a}
        href="https://kubevirt.io/user-guide/operations/node_assignment/#taints-and-tolerations"
        target="_blank"
      >
        {t('Taints and Tolerations documentation')} <ExternalLinkAltIcon />
      </Text>
    </>
  );
};
export default TolerationModalDescriptionText;
