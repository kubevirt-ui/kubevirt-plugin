import type { FC } from 'react';
import { memo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import type { SpinnerProps } from '@patternfly/react-core';
import { Spinner, spinnerSize } from '@patternfly/react-core';

type Loading = { size?: SpinnerProps['size'] | spinnerSize };

const Loading: FC<Loading> = ({ size = spinnerSize.md }) => {
  const { t } = useKubevirtTranslation();
  return <Spinner aria-label={t('Loading')} data-test="loading-spinner" size={size} />;
};

export default memo(Loading);
