import * as React from 'react';

import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Text, TextVariants } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

const TolerationModalDescriptionText: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <Text className="text-muted" component={TextVariants.p}>
        {t(
          'Tolerations are applied to VirtualMachines, and allow (but do not require) the VirtualMachines to schedule onto Nodes with matching taints.',
        )}
      </Text>
      <Text className="text-muted" component={TextVariants.p}>
        {t(
          'Add tolerations to allow a VirtualMachine to schedule onto Nodes with matching taints.',
        )}
      </Text>
      <Text component={TextVariants.a} href={documentationURL.TAINTS_TOLERATION} target="_blank">
        {t('Taints and Tolerations documentation')} <ExternalLinkAltIcon />
      </Text>
    </>
  );
};
export default TolerationModalDescriptionText;
