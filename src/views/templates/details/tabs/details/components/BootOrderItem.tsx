import React from 'react';
import BootOrder from 'src/views/virtualmachinesinstance/details/tabs/details/components/Details/BootOrder/BootOrder';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateDisks, getTemplateInterfaces } from '@kubevirt-utils/resources/template';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

type BootOrderProps = {
  template: V1Template;
};

const BootOrderItem: React.FC<BootOrderProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const disks = getTemplateDisks(template);
  const interfaces = getTemplateInterfaces(template);

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Boot order')}</DescriptionListTerm>
      <DescriptionListDescription>
        <BootOrder disks={disks} interfaces={interfaces} />
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default BootOrderItem;
