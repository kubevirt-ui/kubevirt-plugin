import React, { FC } from 'react';

import Breadcrumbs from '@kubevirt-utils/components/Breadcrumbs/Breadcrumbs';
import { FLAG_LIGHTSPEED_PLUGIN } from '@kubevirt-utils/flags/consts';
import LightspeedHelpButton from '@lightspeed/components/LightspeedHelpButton/LightspeedHelpButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { useFlag } from '@openshift-console/dynamic-plugin-sdk';
import { Split, SplitItem } from '@patternfly/react-core';

type LightspeedPopoverContentFooterProps = {
  breadcrumb?: string;
  hide: () => void;
  obj?: K8sResourceCommon;
  promptType: OLSPromptType;
};

const LightspeedPopoverContentFooter: FC<LightspeedPopoverContentFooterProps> = ({
  breadcrumb,
  hide,
  obj,
  promptType,
}) => {
  const hasOLSConsole = useFlag(FLAG_LIGHTSPEED_PLUGIN);
  const breadcrumbs = <Breadcrumbs breadcrumb={breadcrumb} />;

  if (!hasOLSConsole) {
    return breadcrumb ? breadcrumbs : null;
  }

  return (
    <Split className="pf-v6-u-mt-md">
      {breadcrumb && <SplitItem>{breadcrumbs}</SplitItem>}
      <SplitItem isFilled />
      <SplitItem>
        <LightspeedHelpButton obj={obj} onClick={hide} promptType={promptType} />
      </SplitItem>
    </Split>
  );
};

export default LightspeedPopoverContentFooter;
