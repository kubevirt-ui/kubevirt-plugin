import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';
import BootOrder from 'src/views/virtualmachinesinstance/details/tabs/details/components/Details/BootOrder/BootOrder';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateDisks, getTemplateInterfaces } from '@kubevirt-utils/resources/template';

type BootOrderProps = {
  template: V1Template;
};

const BootOrderItem: React.FC<BootOrderProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const disks = getTemplateDisks(template);
  const interfaces = getTemplateInterfaces(template);
  const disksTabLink = `/k8s/ns/${template.metadata.namespace}/templates/${template.metadata.name}/disks`;

  return (
    <VirtualMachineDescriptionItem
      bodyContent={
        <Trans ns="plugin__kubevirt-plugin">
          You can edit the boot order in the <Link to={disksTabLink}>{t('Disks tab')}</Link>
        </Trans>
      }
      descriptionData={<BootOrder disks={disks} interfaces={interfaces} />}
      descriptionHeader={t('Boot order')}
      isPopover
    />
  );
};

export default BootOrderItem;
