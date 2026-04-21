import React, { FC } from 'react';

import { FLAG_LIGHTSPEED_PLUGIN } from '@kubevirt-utils/flags/consts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import AIExperienceIcon from '@lightspeed/components/AIExperienceIcon';
import useLightspeedQuery from '@lightspeed/hooks/useLightspeedQuery';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';
import { Skeleton, Stack, StackItem } from '@patternfly/react-core';

type LightspeedContentProps = { prompt: string };

const LightspeedContent: FC<LightspeedContentProps> = ({ prompt }) => {
  const { t } = useKubevirtTranslation();
  const { data, dataLoaded, error } = useLightspeedQuery(prompt);
  const hasOLSConsole = useFlag(FLAG_LIGHTSPEED_PLUGIN);

  if (!hasOLSConsole) return null;

  return (
    <Stack>
      <StackItem>
        <AIExperienceIcon />
      </StackItem>
      <StackItem>
        {!dataLoaded && <Skeleton />}
        {dataLoaded && !error && data?.['response']}
        {dataLoaded && error && t('An OpenShift Lightspeed error occurred.')}
      </StackItem>
    </Stack>
  );
};

export default LightspeedContent;
