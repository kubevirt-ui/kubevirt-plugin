import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import usePasstFeatureFlag from '@overview/SettingsTab/PreviewFeaturesTab/hooks/usePasstFeatureFlag';
import { Content, Popover } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type VirtctlDisabledProps = {
  cluster?: string;
  namespace: string;
};

const VirtctlDisabled: FC<VirtctlDisabledProps> = ({ cluster, namespace }) => {
  const { t } = useKubevirtTranslation();

  const [, , nad] = useNamespaceUDN(namespace);
  const { featureEnabled: passtEnabled } = usePasstFeatureFlag();

  if (passtEnabled) {
    return (
      <>
        {t('Not available with l2bridge binding')}{' '}
        <Popover
          bodyContent={
            <Content>
              <Trans t={t}>
                To open an SSH connection with the VirtualMachine using virtctl select the{' '}
                <strong>Passt</strong> option in the network binding dropdown
              </Trans>
            </Content>
          }
          footerContent={
            <ExternalLink href={documentationURL.PASST}>{t('Learn more')}</ExternalLink>
          }
        >
          <HelpIcon />
        </Popover>
      </>
    );
  }

  return (
    <>
      {t("Virtctl is disabled for this namespace as it's managed by")}{' '}
      <MulticlusterResourceLink
        cluster={cluster}
        groupVersionKind={NetworkAttachmentDefinitionModelGroupVersionKind}
        inline
        name={getName(nad)}
        namespace={getNamespace(nad)}
      />{' '}
    </>
  );
};

export default VirtctlDisabled;
