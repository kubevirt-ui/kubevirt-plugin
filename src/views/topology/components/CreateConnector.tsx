import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DefaultCreateConnector, Point } from '@patternfly/react-topology';

type CreateConnectorProps = {
  dragging?: boolean;
  endPoint: Point;
  hints: string[];
  hover?: boolean;
  startPoint: Point;
};

const CreateConnector: FC<CreateConnectorProps> = ({
  dragging,
  endPoint,
  hints,
  hover,
  startPoint,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <DefaultCreateConnector
      dragging={dragging}
      endPoint={endPoint}
      hints={hints}
      hover={hover}
      startPoint={startPoint}
      tipContents={hover && dragging ? t('Add resources') : null}
    />
  );
};

export default CreateConnector;
