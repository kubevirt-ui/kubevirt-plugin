import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import ListEmptyState from '@kubevirt-utils/components/ListEmptyState/ListEmptyState';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { PficonTemplateIcon } from '@patternfly/react-icons';

import VirtualMachineTemplatesCreateButton from '../VirtualMachineTemplatesCreateButton/VirtualMachineTemplatesCreateButton';

const VirtualMachineTemplatesEmptyState: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <ListPageHeader title={t('Templates')} />
      <ListPageBody>
        <ListEmptyState
          learnMoreLink={
            <ExternalLink
              href={documentationURL.CREATING_VMS_FROM_TEMPLATES}
              text={t('Learn more about templates')}
            />
          }
          bodyContent={t('To get started, create a template.')}
          buttonAction={<VirtualMachineTemplatesCreateButton />}
          icon={PficonTemplateIcon}
          titleText={t("You don't have any templates yet")}
        />
      </ListPageBody>
    </>
  );
};

export default VirtualMachineTemplatesEmptyState;
