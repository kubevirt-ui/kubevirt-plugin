import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import BootOrder from 'src/views/virtualmachinesinstance/details/tabs/details/components/Details/BootOrder/BootOrder';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getTemplateDisks, getTemplateInterfaces } from '@kubevirt-utils/resources/template';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTermHelpText,
  DescriptionListTermHelpTextButton,
  Popover,
} from '@patternfly/react-core';

type BootOrderProps = {
  template: V1Template;
};

const BootOrderItem: React.FC<BootOrderProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const disks = getTemplateDisks(template);
  const interfaces = getTemplateInterfaces(template);
  const disksTabLink = `/k8s/ns/${template.metadata.namespace}/templates/${template.metadata.name}/disks`;

  return (
    <DescriptionListGroup>
      <DescriptionListTermHelpText>
        <Popover
          bodyContent={
            <Trans ns="plugin__kubevirt-plugin">
              You can edit the boot order in the <Link to={disksTabLink}>{t('Disks tab')}</Link>
            </Trans>
          }
          hasAutoWidth
          maxWidth="15rem"
          position="right"
        >
          <DescriptionListTermHelpTextButton>{t('Boot order')}</DescriptionListTermHelpTextButton>
        </Popover>
      </DescriptionListTermHelpText>

      <DescriptionListDescription>
        <BootOrder disks={disks} interfaces={interfaces} />
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default BootOrderItem;
