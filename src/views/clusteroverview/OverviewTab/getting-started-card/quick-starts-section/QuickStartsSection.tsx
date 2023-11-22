import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { QuickStartsLoader } from '@openshift-console/dynamic-plugin-sdk-internal';
import {
  AllQuickStartStates,
  QuickStart,
  QuickStartContext,
  QuickStartContextValues,
} from '@patternfly/quickstarts';
import { RouteIcon } from '@patternfly/react-icons';

import GettingStartedSectionContents from '../utils/getting-started-content/GettingStartedSectionContents';
import { GettingStartedLink } from '../utils/types';

import { orderQuickStarts } from './utils';

interface QuickStartsSectionProps {
  allQuickStartStates?: AllQuickStartStates;
  description?: string;
  featured?: string[];
  filter?: (QuickStart) => boolean;
  setActiveQuickStart?: (quickStartId: string, totalTasks?: number) => void;
  title?: string;
}

const QuickStartsSection: React.FC<QuickStartsSectionProps> = ({
  description,
  featured,
  filter,
  title,
}) => {
  const { t } = useKubevirtTranslation();
  const { allQuickStartStates, setActiveQuickStart } =
    React.useContext<QuickStartContextValues>(QuickStartContext);

  return (
    <QuickStartsLoader>
      {(quickStarts, loaded) => {
        const orderedQuickStarts = orderQuickStarts(
          quickStarts,
          allQuickStartStates,
          featured,
          filter,
        );
        const slicedQuickStarts = orderedQuickStarts.slice(0, 2);

        if (loaded && slicedQuickStarts.length === 0) {
          return null;
        }

        const links: GettingStartedLink[] = loaded
          ? slicedQuickStarts.map((quickStart: QuickStart) => ({
              id: quickStart.metadata.name,
              onClick: () => {
                setActiveQuickStart(quickStart.metadata.name, quickStart.spec.tasks.length);
              },
              title: quickStart.spec.displayName,
            }))
          : featured?.map((name) => ({
              id: name,
              loading: true,
            }));

        const moreLink: GettingStartedLink = {
          href: '/quickstart',
          id: 'all-quick-starts',
          title: t('View all quick starts'),
        };

        return (
          <GettingStartedSectionContents
            description={
              description ||
              t(
                'Follow guided documentation to build applications and familiarize yourself with key features.',
              )
            }
            icon={<RouteIcon aria-hidden="true" color="var(--co-global--palette--purple-600)" />}
            id="quick-start"
            links={links}
            moreLink={moreLink}
            title={title || t('Build with guided documentation')}
            titleColor={'var(--co-global--palette--purple-700)'}
          />
        );
      }}
    </QuickStartsLoader>
  );
};

export default QuickStartsSection;
