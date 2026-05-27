import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import GeneralSettingsNamespace from '../../../shared/GeneralSettingsNamespace';

import {
  getCurrentTemplatesNamespaceFromHCO,
  OPENSHIFT,
  updateHCOCommonTemplatesNamespace,
} from './utils/utils';

import '../../../shared/general-settings.scss';

type TemplatesNamespaceSectionProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
  namespacesData: [namespaces: K8sResourceCommon[], loaded: boolean, error: any];
};

const TemplatesNamespaceSection: FC<TemplatesNamespaceSectionProps> = ({
  hyperConvergeConfiguration,
  namespacesData,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <GeneralSettingsNamespace
      description={
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          Select a namespace for Red Hat templates. The default namespace is &apos;openshift&apos;. If
          you want to store Red Hat templates in multiple namespaces, you must clone
          <br />
          the Red Hat template by selecting <b>Clone template</b> from the template action menu and
          then selecting another namespace for the cloned template.
        </Trans>
      }
      hcoResourceNamespace={getCurrentTemplatesNamespaceFromHCO(hyperConvergeConfiguration?.[0])}
      hyperConvergeConfiguration={hyperConvergeConfiguration}
      namespace={OPENSHIFT}
      onChange={updateHCOCommonTemplatesNamespace}
      namespacesData={namespacesData}
      searchItemId={CLUSTER_TAB_IDS.templatesNamespace}
      toggleText={t('Template namespace')}
    />
  );
};

export default TemplatesNamespaceSection;
