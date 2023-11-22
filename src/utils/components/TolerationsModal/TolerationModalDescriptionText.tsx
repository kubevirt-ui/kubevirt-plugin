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
          'Tolerations are applied to VirtualMachines, and allow (but do not require) the VirtualMachines to schedule onto Nodes with matching taints.',
        )}
      </Text>
      <Text className="text-muted" component={TextVariants.p}>
        {t(
          'Add tolerations to allow a VirtualMachine to schedule onto Nodes with matching taints.',
        )}
      </Text>
      <Text
        component={TextVariants.a}
        href="https://docs.openshift.com/container-platform/4.10/virt/virtual_machines/advanced_vm_management/virt-specifying-nodes-for-vms.html#virt-about-node-placement-vms_virt-specifying-nodes-for-vms"
        target="_blank"
      >
        {t('Taints and Tolerations documentation')} <ExternalLinkAltIcon />
      </Text>
    </>
  );
};
export default TolerationModalDescriptionText;
