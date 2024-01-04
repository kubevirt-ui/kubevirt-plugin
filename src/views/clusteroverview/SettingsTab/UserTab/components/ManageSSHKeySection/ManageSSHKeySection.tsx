import React, { FC } from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

import SSHAuthKeysList from './SSHAuthKeysList/SSHAuthKeysList';

const ManageSSHKeySection: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <ExpandSection toggleText={t('Manage SSH keys')}>
      <Stack hasGutter>
        <MutedTextSpan
          text={t(
            'Set the public SSH key to automatically apply to any new VirtualMachine you create in the selected project.',
          )}
        />
        <SSHAuthKeysList />
      </Stack>
    </ExpandSection>
  );
};

export default ManageSSHKeySection;
