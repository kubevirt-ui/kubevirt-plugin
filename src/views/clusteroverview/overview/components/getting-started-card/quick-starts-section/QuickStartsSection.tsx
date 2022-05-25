import * as React from 'react';
import { useTranslation } from 'react-i18next';

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
  featured?: string[];
  title?: string;
  description?: string;
  filter?: (QuickStart) => boolean;
  allQuickStartStates?: AllQuickStartStates;
  setActiveQuickStart?: (quickStartId: string, totalTasks?: number) => void;
}

const QuickStartsSection: React.FC<QuickStartsSectionProps> = ({
  featured,
  title,
  description,
  filter,
}) => {
  const { t } = useTranslation();
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
              title: quickStart.spec.displayName,
              onClick: () => {
                setActiveQuickStart(quickStart.metadata.name, quickStart.spec.tasks.length);
              },
            }))
          : featured?.map((name) => ({
              id: name,
              loading: true,
            }));

        const moreLink: GettingStartedLink = {
          id: 'all-quick-starts',
          title: t('View all quick starts'),
          href: '/quickstart',
        };

        return (
          <GettingStartedSectionContents
            id="quick-start"
            icon={<RouteIcon color="var(--co-global--palette--purple-600)" aria-hidden="true" />}
            title={title || t('Build with guided documentation')}
            titleColor={'var(--co-global--palette--purple-700)'}
            description={
              description ||
              t(
                'Follow guided documentation to build applications and familiarize yourself with key features.',
              )
            }
            links={links}
            moreLink={moreLink}
          />
        );
      }}
    </QuickStartsLoader>
  );
};

export default QuickStartsSection;
