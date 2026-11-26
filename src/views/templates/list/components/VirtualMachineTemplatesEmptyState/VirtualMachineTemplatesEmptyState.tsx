import type { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import ListEmptyState from '@kubevirt-utils/components/ListEmptyState/ListEmptyState';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DocumentTitle, ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { PficonTemplateIcon } from '@patternfly/react-icons';

import VirtualMachineTemplatesCreateButton from '../VirtualMachineTemplatesCreateButton/VirtualMachineTemplatesCreateButton';

type VirtualMachineTemplatesEmptyStateProps = {
  pageTitle: string;
};

const VirtualMachineTemplatesEmptyState: FC<VirtualMachineTemplatesEmptyStateProps> = ({
  pageTitle,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <DocumentTitle>{pageTitle}</DocumentTitle>
      <ListPageHeader title={pageTitle} />
      <ListPageBody>
        <ListEmptyState
          bodyContent={t('To get started, create a template.')}
          buttonAction={<VirtualMachineTemplatesCreateButton />}
          icon={PficonTemplateIcon}
          learnMoreLink={
            <ExternalLink
              href={documentationURL.CREATING_VMS_FROM_TEMPLATES}
              text={t('Learn more about templates')}
            />
          }
          titleText={t("You don't have any templates yet")}
        />
      </ListPageBody>
    </>
  );
};

export default VirtualMachineTemplatesEmptyState;
