import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { recommendedOperatorIcon } from '../../../utils/svg/icons';
import GettingStartedContent from '../utils/getting-started-content/GettingStartedContent';
import useMTVResources from '../utils/hooks/useMTVResources';
import { GettingStartedLink } from '../utils/types';

import './RelatedOperatorsSection.scss';

const RelatedOperatorsSection: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const { mtvLoaded, mtvLink } = useMTVResources();

  const moreLink: GettingStartedLink = {
    id: 'openshift-virtualization-related-operators',
    title: t('Learn more about Operators'),
    href: '/operatorhub/all-namespaces',
    external: true,
  };

  const links: GettingStartedLink[] = [
    {
      id: 'kubernetes-nmstate',
      title: t('Kubernetes NMState Operator'),
      href: '/operatorhub/all-namespaces?keyword=nmstate',
    },
    {
      id: 'openshift-data-foundation',
      title: t('OpenShift Data Foundation'),
      href: '/operatorhub/all-namespaces?keyword=OCS',
    },
    {
      id: 'openshift-virtualization-mtv',
      title: t('Migration Toolkit for Virtualization'),
      description: t('Migrate multiple virtual machine workloads to OpenShift Virtualization. '),
      href: '/operatorhub/all-namespaces?keyword=MTV',
      moreLinkText: t('Launch Migration Toolkit for Virtualization web console'),
      moreLinkHref: mtvLink,
      showMoreLink: mtvLoaded && !!mtvLink,
      moreLinkExternal: true,
    },
  ];

  return (
    <GettingStartedContent
      id="related-operators"
      icon={
        <img
          id="kv-getting-started--related-operators-icon"
          src={recommendedOperatorIcon}
          alt={t('Related operators')}
        />
      }
      title={t('Related operators')}
      titleColor={'var(--pf-global--palette--blue-600)'}
      description={t('Ease operational complexity with virtualization by using Operators.')}
      links={links}
      moreLink={moreLink}
    />
  );
};

export default RelatedOperatorsSection;
