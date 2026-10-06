import type { FC } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router';
import BootOrder from 'src/views/virtualmachinesinstance/details/tabs/details/components/Details/BootOrder/BootOrder';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import type { Template } from '@kubevirt-utils/resources/template';
import {
  getTemplateDisks,
  getTemplateInterfaces,
  getTemplateURL,
} from '@kubevirt-utils/resources/template';
import { getCluster } from '@multicluster/helpers/selectors';

type BootOrderProps = {
  template: Template;
};

const BootOrderItem: FC<BootOrderProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const disks = getTemplateDisks(template);
  const interfaces = getTemplateInterfaces(template);
  const disksTabLink = `${getTemplateURL(getName(template), getNamespace(template), getCluster(template))}/disks`;

  return (
    <DescriptionItem
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
