import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import GettingStartedSectionContents from '../utils/getting-started-content/GettingStartedSectionContents';
import { GettingStartedLink } from '../utils/types';

import FeatureHighlightsTitle from './FeatureHighlightsTitle';

import './FeatureHighlightsSection.scss';

const FeatureHighlightsSection: React.FC = () => {
  const { t } = useKubevirtTranslation();

  const moreLink: GettingStartedLink = {
    external: true,
    href: 'https://cloud.redhat.com/learn/topics/virtualization/',
    id: 'openshift-virtualization-feature-highlights',
    title: t('Visit the blog'),
  };

  const links: GettingStartedLink[] = [
    {
      external: true,
      href: 'https://developers.redhat.com/articles/2024/03/13/save-memory-openshift-virtualization-using-free-page-reporting',
      id: 'item1',
      title: (
        <FeatureHighlightsTitle
          readTime={t('8 min')}
          title={t('Save memory with OpenShift Virtualization using Free Page Reporting')}
        />
      ),
    },
    {
      external: true,
      href: 'https://docs.openshift.com/container-platform/4.15/virt/release_notes/virt-4-15-release-notes.html#virt-4-15-new',
      id: 'item2',
      title: (
        <FeatureHighlightsTitle
          readTime={t('5 min')}
          title={t('OpenShift Virtualization 4.15 Highlights')}
        />
      ),
    },
  ];

  return (
    <GettingStartedSectionContents
      description={t(
        'Read about the latest information and key virtualization features on the Virtualization highlights.',
      )}
      icon={
        <i
          aria-hidden="true"
          className="fas fa-blog"
          color="var(--pf-global--primary-color--100)"
        />
      }
      id="feature-highlights"
      links={links}
      moreLink={moreLink}
      title={t('Feature highlights')}
      titleColor={'var(--co-global--palette--blue-400)'}
    />
  );
};

export default FeatureHighlightsSection;
