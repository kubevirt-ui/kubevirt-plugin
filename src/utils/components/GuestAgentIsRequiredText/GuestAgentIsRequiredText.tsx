import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';

type GuestAgentIsRequiredTextProps = {
  vmi: V1VirtualMachineInstance;
};

const GuestAgentIsRequiredText: FC<GuestAgentIsRequiredTextProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();

  return <MutedTextSpan text={vmi ? t('Guest agent is required') : t('Not available')} />;
};

export default GuestAgentIsRequiredText;
