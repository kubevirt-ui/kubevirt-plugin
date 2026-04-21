import React, { FC } from 'react';

import { FLAG_LIGHTSPEED_PLUGIN } from '@kubevirt-utils/flags/consts';
import LightspeedContent from '@lightspeed/components/LightspeedContent';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';
import { Card } from '@patternfly/react-core';

type LightspeedCardProps = {
  prompt: string;
};

const LightspeedCard: FC<LightspeedCardProps> = ({ prompt }) => {
  const hasOLSConsole = useFlag(FLAG_LIGHTSPEED_PLUGIN);

  if (!hasOLSConsole) return null;

  return (
    <Card className="pf-v6-u-p-sm">
      <LightspeedContent prompt={prompt} />
    </Card>
  );
};

export default LightspeedCard;
