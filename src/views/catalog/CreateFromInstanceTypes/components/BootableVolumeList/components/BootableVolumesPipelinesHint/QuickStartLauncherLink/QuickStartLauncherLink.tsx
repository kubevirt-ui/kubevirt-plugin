import React, { FC, useContext } from 'react';

import { getName } from '@kubevirt-utils/resources/shared';
import {
  QuickStart,
  QuickStartContext,
  QuickStartContextProvider,
  QuickStartContextValues,
  useValuesForQuickStartContext,
} from '@patternfly/quickstarts';
import { Button, ButtonVariant } from '@patternfly/react-core';

import { GettingStartedLink } from '../../../../../../../clusteroverview/OverviewTab/getting-started-card/utils/types';

import './QuickStartLauncherLink.scss';

type QuickStartLauncherLinkProps = {
  quickStart: QuickStart;
  quickStartLoaded: boolean;
  text: string;
};

const QuickStartLauncherLink: FC<QuickStartLauncherLinkProps> = ({
  quickStart,
  quickStartLoaded,
  text,
}) => {
  const quickStartValues = useValuesForQuickStartContext();
  const { setActiveQuickStart } = useContext<QuickStartContextValues>(QuickStartContext);

  const quickStartLink: GettingStartedLink = quickStartLoaded && {
    id: getName(quickStart),
    onClick: () => {
      setActiveQuickStart(quickStart.metadata.name, quickStart.spec.tasks.length);
    },
    title: quickStart.spec.displayName,
  };

  const handleClick = quickStartLink.onClick;

  return (
    <QuickStartContextProvider value={quickStartValues}>
      <Button
        className="quick-start-launcher-link"
        onClick={handleClick}
        variant={ButtonVariant.link}
      >
        {text}
      </Button>
    </QuickStartContextProvider>
  );
};

export default QuickStartLauncherLink;
