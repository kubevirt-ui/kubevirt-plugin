import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Flex,
  FlexItem,
  Progress,
  ProgressMeasureLocation,
  ProgressVariant,
  Spinner,
} from '@patternfly/react-core';

type UploadProgressBarProps = {
  fileName: string;
  progress: number;
  showSpinner: boolean;
  variant?: ProgressVariant;
};

const UploadProgressBar: FC<UploadProgressBarProps> = ({
  fileName,
  progress,
  showSpinner,
  variant,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} columnGap={{ default: 'columnGapSm' }}>
      {showSpinner && (
        <FlexItem shrink={{ default: 'shrink' }}>
          <Spinner size="md" />
        </FlexItem>
      )}
      <FlexItem grow={{ default: 'grow' }}>
        <Progress
          aria-label={t('Upload progress for {{fileName}}', { fileName })}
          measureLocation={ProgressMeasureLocation.outside}
          value={progress}
          variant={variant}
        />
      </FlexItem>
    </Flex>
  );
};

export default UploadProgressBar;
