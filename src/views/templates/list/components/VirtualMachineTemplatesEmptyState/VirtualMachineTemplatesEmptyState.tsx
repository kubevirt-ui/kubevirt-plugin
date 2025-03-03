import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { PficonTemplateIcon } from '@patternfly/react-icons';

import VirtualMachineTemplatesCreateButton from '../VirtualMachineTemplatesCreateButton/VirtualMachineTemplatesCreateButton';

type VirtualMachineTemplatesEmptyStateProps = {
  namespace: string;
};

const VirtualMachineTemplatesEmptyState: FC<VirtualMachineTemplatesEmptyStateProps> = ({
  namespace,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <ListPageHeader title={t('VirtualMachine Templates')} />
      <ListPageBody>
        <EmptyState
          headingLevel="h4"
          icon={PficonTemplateIcon}
          titleText={<>{t('No Templates found')}</>}
          variant={EmptyStateVariant.lg}
        >
          <EmptyStateBody>
            <Trans ns="plugin__kubevirt-plugin" t={t}>
              Click <b>Create Template</b> to create your first template
            </Trans>
          </EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <VirtualMachineTemplatesCreateButton namespace={namespace} />
            </EmptyStateActions>
            <br />
            <EmptyStateActions>
              <ExternalLink
                href={documentationURL.CREATING_VMS_FROM_TEMPLATES}
                text={t('Learn more about templates')}
              />
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </ListPageBody>
    </>
  );
};

export default VirtualMachineTemplatesEmptyState;
