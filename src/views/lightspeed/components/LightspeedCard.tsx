import React, { FC } from 'react';

import { HTTP_METHODS } from '@kubevirt-utils/constants/constants';
import useConsoleFetch from '@kubevirt-utils/hooks/useConsoleFetch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import AIExperienceIcon from '@lightspeed/components/AIExperienceIcon';
import { QUERY_ENDPOINT } from '@lightspeed/utils/api';
import { Card, Skeleton, Stack, StackItem } from '@patternfly/react-core';

type LightspeedCardProps = {
  prompt: string;
};

const LightspeedCard: FC<LightspeedCardProps> = ({ prompt }) => {
  const { t } = useKubevirtTranslation();
  const { data, error, loaded } = useConsoleFetch(QUERY_ENDPOINT, 2000000, {
    body: JSON.stringify({ media_type: 'application/json', query: prompt }),
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: HTTP_METHODS.POST,
  });

  if (error) kubevirtConsole.error(error);

  return (
    <Card className="pf-v6-u-p-sm">
      <Stack>
        <StackItem>
          <AIExperienceIcon />
        </StackItem>
        <StackItem>
          {!loaded && <Skeleton />}
          {loaded && !error && data?.['response']}
          {loaded && error && t('An OpenShift Lightspeed error occurred.')}
        </StackItem>
      </Stack>
    </Card>
  );
};

export default LightspeedCard;
