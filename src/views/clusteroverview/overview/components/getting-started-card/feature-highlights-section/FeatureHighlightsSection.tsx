import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import GettingStartedContent from '../utils/getting-started-content/GettingStartedContent';
import { GettingStartedLink } from '../utils/types';

import FeatureHighlightsTitle from './FeatureHighlightsTitle';

import './FeatureHighlightsSection.scss';

const FeatureHighlightsSection: React.FC = () => {
  const { t } = useKubevirtTranslation();

  const moreLink: GettingStartedLink = {
    id: 'openshift-virtualization-feature-highlights',
    title: t('Visit the blog'),
    href: 'https://cloud.redhat.com/learn/topics/virtualization/',
    external: true,
  };

  const links: GettingStartedLink[] = [
    {
      id: 'item1',
      title: (
        <FeatureHighlightsTitle
          title={t('Automatic Windows VM installation')}
          readTime={t('8 min')}
        />
      ),
      href: 'https://www.openshift.com/blog/automatic-installation-of-a-windows-vm-using-openshift-virtualization',
      external: true,
    },
    {
      id: 'item2',
      title: (
        <FeatureHighlightsTitle
          title={t('OpenShift Virtualization 4.10 Highlights')}
          readTime={t('5 min')}
        />
      ),
      href: 'https://www.openshift.com/blog/whats-new-in-openshift-virtualization-4.10',
      external: true,
    },
  ];

  return (
    <GettingStartedContent
      id="feature-highlights"
      icon={
        <i
          className="fas fa-blog"
          color="var(--pf-global--primary-color--100)"
          aria-hidden="true"
        />
      }
      title={t('Feature highlights')}
      titleColor={'var(--pf-global--palette--blue-600)'}
      description={t(
        'Read about the latest information and key virtualization features on the Virtualization highlights.',
      )}
      links={links}
      moreLink={moreLink}
    />
  );
};

export default FeatureHighlightsSection;
