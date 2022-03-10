import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { recommendedOperatorIcon } from '../../../utils/svg/icons';
import GettingStartedContent from '../utils/getting-started-content/GettingStartedContent';
import { GettingStartedLink } from '../utils/types';

import './RecommendedOperatorsSection.scss';

const RecommendedOperatorsSection: React.FC = () => {
  const { t } = useKubevirtTranslation();

  const moreLink: GettingStartedLink = {
    id: 'openshift-virtualization-recommended-operators',
    title: t('Learn more about Operators'),
    href: '/operatorhub/all-namespaces',
    external: true,
  };

  const links: GettingStartedLink[] = [
    {
      id: 'openshift-virtualization-ocs',
      title: t('OpenShift Container Storage'),
      href: '/operatorhub/all-namespaces?keyword=OCS',
    },
    {
      id: 'openshift-virtualization-mtv',
      title: t('Migration Toolkit for Virtualization'),
      href: '/operatorhub/all-namespaces?keyword=MTV',
    },
  ];

  return (
    <GettingStartedContent
      id="recommended-operators"
      icon={
        <img
          id="kv-getting-started--recommended-operators-icon"
          src={recommendedOperatorIcon}
          alt={t('Recommended Operators')}
        />
      }
      title={t('Recommended Operators')}
      titleColor={'var(--pf-global--palette--blue-600)'}
      description={t('Ease operational complexity with virtualization by using Operators.')}
      links={links}
      moreLink={moreLink}
    />
  );
};

export default RecommendedOperatorsSection;
