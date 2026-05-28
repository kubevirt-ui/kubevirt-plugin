import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Content, ContentVariants, List, ListItem } from '@patternfly/react-core';

const CreateTemplateContent: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <Content component={ContentVariants.p}>{t('You can now create templates by:')}</Content>
      <List>
        <ListItem>
          <Trans t={t}>
            <b>Cloning and customizing</b> an existing template from your library.
          </Trans>
        </ListItem>
        <ListItem>
          <Trans t={t}>
            <b>Standardizing a VM</b> by selecting <b>Save as template</b> from the{' '}
            <b>VirtualMachines</b> page.
          </Trans>
        </ListItem>
        <Content component={ContentVariants.small}>
          <Trans t={t}>
            <b>Tip</b>: Right-click any VM in the sidebar to save it as a template.
          </Trans>
        </Content>
      </List>
    </>
  );
};

export default CreateTemplateContent;
