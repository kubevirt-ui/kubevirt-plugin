import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import GettingStartedSectionContents from '../utils/getting-started-content/GettingStartedSectionContents';
import useMTVResources from '../utils/hooks/useMTVResources';
import { GettingStartedLink } from '../utils/types';

import './RelatedOperatorsSection.scss';

const RelatedOperatorsSection: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const { mtvLoaded, mtvLink } = useMTVResources();

  const moreLink: GettingStartedLink = {
    id: 'openshift-virtualization-related-operators',
    title: t('Learn more about Operators'),
    href: 'https://access.redhat.com/documentation/en-us/openshift_container_platform/4.10/html/operators/',
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
      secondaryLinkText: t('Launch Migration Toolkit for Virtualization web console'),
      secondaryLinkHref: mtvLink,
      showSecondaryLink: mtvLoaded && !!mtvLink,
      secondaryLinkExternal: true,
    },
  ];

  return (
    <GettingStartedSectionContents
      id="related-operators"
      icon={
        <i
          className="fas fa-cubes"
          color="var(--pf-global--primary-color--100)"
          aria-hidden="true"
          id="kv-getting-started--related-operators-icon"
        />
      }
      title={t('Related operators')}
      titleColor={'var(--co-global--palette--orange-400)'}
      description={t('Ease operational complexity with virtualization by using Operators.')}
      links={links}
      moreLink={moreLink}
    />
  );
};

export default RelatedOperatorsSection;
