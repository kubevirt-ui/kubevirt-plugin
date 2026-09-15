import { type FC, type ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { type ListPageHeaderProps } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/console-types';

type VirtualMachinesListPageHeaderProps = {
  children?: ReactNode;
} & Omit<ListPageHeaderProps, 'title'>;

const VirtualMachinesListPageHeader: FC<VirtualMachinesListPageHeaderProps> = ({
  children,
  ...listPageHeaderProps
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <ListPageHeader title={t('VirtualMachines')} {...listPageHeaderProps}>
      {children}
    </ListPageHeader>
  );
};

export default VirtualMachinesListPageHeader;
