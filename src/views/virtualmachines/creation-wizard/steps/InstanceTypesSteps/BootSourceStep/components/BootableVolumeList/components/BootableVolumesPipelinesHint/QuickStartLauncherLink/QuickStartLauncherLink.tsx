import React, { FCC } from 'react';

import { getName } from '@kubevirt-utils/resources/shared';
import { useQuickStartContext } from '@openshift-console/dynamic-plugin-sdk';
import { GettingStartedLink } from '@overview/OverviewTab/getting-started-card/utils/types';
import {
  QuickStart,
  QuickStartContextProvider,
  useValuesForQuickStartContext,
} from '@patternfly/quickstarts';
import { Button, ButtonVariant } from '@patternfly/react-core';

import './QuickStartLauncherLink.scss';

type QuickStartLauncherLinkProps = {
  quickStart: QuickStart;
  quickStartLoaded: boolean;
  text: string;
};

const QuickStartLauncherLink: FCC<QuickStartLauncherLinkProps> = ({
  quickStart,
  quickStartLoaded,
  text,
}) => {
  const quickStartValues = useValuesForQuickStartContext();
  const { setActiveQuickStart } = useQuickStartContext();

  const quickStartLink: GettingStartedLink | null = quickStartLoaded
    ? {
        id: getName(quickStart),
        onClick: () => {
          setActiveQuickStart(quickStart.metadata.name, quickStart?.spec?.tasks?.length);
        },
        title: quickStart?.spec?.displayName,
      }
    : null;

  const handleClick = quickStartLink?.onClick;

  return (
    <QuickStartContextProvider value={quickStartValues}>
      <Button
        className="quick-start-launcher-link"
        isDisabled={!handleClick}
        isInline
        onClick={handleClick}
        variant={ButtonVariant.link}
      >
        {text}
      </Button>
    </QuickStartContextProvider>
  );
};

export default QuickStartLauncherLink;
