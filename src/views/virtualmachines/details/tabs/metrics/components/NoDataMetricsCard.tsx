import React, { FC } from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye, Card, CardBody, CardTitle } from '@patternfly/react-core';

type NoDataMetricsCardProps = {
  title: string;
};

const NoDataMetricsCard: FC<NoDataMetricsCardProps> = ({ title }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <CardBody>
        <Bullseye>
          <MutedTextSpan text={t('Not available')} />
        </Bullseye>
      </CardBody>
    </Card>
  );
};

export default NoDataMetricsCard;
