import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Spinner, SpinnerProps, spinnerSize } from '@patternfly/react-core';

type Loading = { size?: SpinnerProps['size'] | spinnerSize };

const Loading: FC<Loading> = ({ size = spinnerSize.md }) => {
  const { t } = useKubevirtTranslation();
  return <Spinner aria-label={t('Loading')} size={size} />;
};

export default React.memo(Loading);
