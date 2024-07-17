import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import GeneralSettingsProject from '../shared/GeneralSettingsProject';

import {
  getCurrentTemplatesNamespaceFromHCO,
  OPENSHIFT,
  updateHCOCommonTemplatesNamespace,
} from './utils/utils';

import '../shared/general-settings.scss';

type TemplatesProjectSectionProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
  projectsData: [projects: K8sResourceCommon[], loaded: boolean, error: any];
};

const TemplatesProjectSection: FC<TemplatesProjectSectionProps> = ({
  hyperConvergeConfiguration,
  projectsData,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <GeneralSettingsProject
      description={
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          Select a project for Red Hat templates. The default project is &apos;openshift&apos;. If
          you want to store Red Hat templates in multiple projects, you must clone
          <br />
          the Red Hat template by selecting <b>Clone template</b> from the template action menu and
          then selecting another project for the cloned template.
        </Trans>
      }
      hcoResourceNamespace={getCurrentTemplatesNamespaceFromHCO(hyperConvergeConfiguration?.[0])}
      hyperConvergeConfiguration={hyperConvergeConfiguration}
      namespace={OPENSHIFT}
      onChange={updateHCOCommonTemplatesNamespace}
      projectsData={projectsData}
      toggleText={t('Template project')}
    />
  );
};

export default TemplatesProjectSection;
