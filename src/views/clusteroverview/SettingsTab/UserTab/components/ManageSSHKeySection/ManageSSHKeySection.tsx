import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import ExpandSection from '../../../ExpandSection/ExpandSection';

const ManageSSHKeySection: FC = () => {
  const { t } = useKubevirtTranslation();

  return <ExpandSection toggleText={t('Manage SSH keys')}></ExpandSection>;
};

export default ManageSSHKeySection;
