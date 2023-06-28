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
      href: 'https://www.openshift.com/blog/automatic-installation-of-a-windows-vm-using-openshift-virtualization',
      id: 'item1',
      title: (
        <FeatureHighlightsTitle
          readTime={t('8 min')}
          title={t('Automatic Windows VirtualMachine installation')}
        />
      ),
    },
    {
      external: true,
      href: 'https://docs.openshift.com/container-platform/4.13/virt/virt-4-13-release-notes.html#virt-4-13-new',
      id: 'item2',
      title: (
        <FeatureHighlightsTitle
          readTime={t('5 min')}
          title={t('OpenShift Virtualization 4.13 Highlights')}
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
