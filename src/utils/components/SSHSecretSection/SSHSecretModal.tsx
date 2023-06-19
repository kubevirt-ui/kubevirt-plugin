import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Skeleton } from '@patternfly/react-core';

import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';
import { isEqualObject } from '../NodeSelectorModal/utils/helpers';
import TabModal from '../TabModal/TabModal';

import { SSHSecretDetails } from './utils/types';
import SSHSecretSection from './SSHSecretSection';

type SSHSecretModalProps = {
  initialSSHSecretDetails: SSHSecretDetails;
  isOpen: boolean;
  isTemplate?: boolean;
  isUserTab?: boolean;
  namespace: string;
  onClose: () => void;
  onSubmit: (sshDetails: SSHSecretDetails, applyKeyToProject?: boolean) => Promise<any | void>;
};

const SSHSecretModal: FC<SSHSecretModalProps> = ({
  initialSSHSecretDetails,
  isOpen,
  isTemplate = false,
  isUserTab = false,
  namespace,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();

  const [sshDetails, setSSHDetails] = useState<SSHSecretDetails>(initialSSHSecretDetails);

  return (
    <TabModal
      headerText={t('Authorized SSH key')}
      isDisabled={isEqualObject(initialSSHSecretDetails, sshDetails)}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit(sshDetails)}
    >
      {isEmpty(initialSSHSecretDetails) ? (
        <Skeleton />
      ) : (
        <>
          <MutedTextSpan text={t('SSH key is saved in the project as a secret')} />
          <SSHSecretSection
            isTemplate={isTemplate}
            isUserTab={isUserTab}
            namespace={namespace}
            setSSHDetails={setSSHDetails}
            sshDetails={sshDetails}
          />
        </>
      )}
    </TabModal>
  );
};

export default SSHSecretModal;
