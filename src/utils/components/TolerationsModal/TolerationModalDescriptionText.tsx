import * as React from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants } from '@patternfly/react-core';

const TolerationModalDescriptionText: React.FC = () => {
  const { t } = useKubevirtTranslation();
  return (
    <>
      <Content className="pf-v6-u-text-color-subtle" component={ContentVariants.p}>
        {t(
          'Tolerations are applied to VirtualMachines, and allow (but do not require) the VirtualMachines to schedule onto Nodes with matching taints.',
        )}
      </Content>
      <Content className="pf-v6-u-text-color-subtle" component={ContentVariants.p}>
        {t(
          'Add tolerations to allow a VirtualMachine to schedule onto Nodes with matching taints.',
        )}
      </Content>
      <ExternalLink
        href={documentationURL.TAINTS_TOLERATION}
        text={t('Taints and Tolerations documentation')}
      />
    </>
  );
};
export default TolerationModalDescriptionText;
