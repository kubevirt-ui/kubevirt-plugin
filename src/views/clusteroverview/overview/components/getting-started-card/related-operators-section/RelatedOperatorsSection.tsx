import * as React from 'react';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import GettingStartedSectionContents from '../utils/getting-started-content/GettingStartedSectionContents';
import useMTVResources from '../utils/hooks/useMTVResources';
import { GettingStartedLink } from '../utils/types';

import './RelatedOperatorsSection.scss';

const RelatedOperatorsSection: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const { mtvLoaded, mtvLink } = useMTVResources();
  const isAdmin = useIsAdmin();

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
      href: isAdmin
        ? '/operatorhub/all-namespaces?keyword=nmstate'
        : 'https://docs.openshift.com/container-platform/4.10/networking/k8s_nmstate/k8s-nmstate-about-the-k8s-nmstate-operator.html',
      external: !isAdmin,
    },
    {
      id: 'openshift-data-foundation',
      title: t('OpenShift Data Foundation'),
      href: isAdmin
        ? '/operatorhub/all-namespaces?keyword=OCS'
        : 'https://access.redhat.com/documentation/en-us/red_hat_openshift_data_foundation/4.10/html-single/red_hat_openshift_data_foundation_architecture/index',
      external: !isAdmin,
    },
    {
      id: 'openshift-virtualization-mtv',
      title: t('Migration Toolkit for Virtualization'),
      description: t('Migrate multiple virtual machine workloads to OpenShift Virtualization. '),
      href: isAdmin
        ? '/operatorhub/all-namespaces?keyword=MTV'
        : 'https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization/2.3/html/installing_and_using_the_migration_toolkit_for_virtualization/index',
      external: !isAdmin,
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
