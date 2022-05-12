import * as React from 'react';
import { Trans } from 'react-i18next';
import { RouteComponentProps, useHistory } from 'react-router-dom';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Brand, Bullseye, Button, Stack, StackItem, Title } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { MIGRATION_TOOL_DOCUMENTATION_URL } from './constant';
import migrationIllustration from './migration-illustration.png';
import useMTVResources from './useMTVResources';
import { createInstallUrl } from './utils';

import './migration-tool-page.scss';

type MigrationToolPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}>;

const MigrationToolPage: React.FC<MigrationToolPageProps> = ({
  match: {
    params: { ns },
  },
}) => {
  const { t } = useKubevirtTranslation();
  const history = useHistory();
  const { loaded, operator: mtvOperator, mtvLink } = useMTVResources();

  if (!loaded)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  const goToOperatorPage = () => {
    history.push(createInstallUrl(mtvOperator, ns));
  };

  return (
    <div className="co-m-pane__body migration-tool-page">
      <Stack hasGutter>
        <StackItem>
          <Title headingLevel="h2" className="co-section-heading">
            {t('Migration Toolkit for Virtualization')}
          </Title>
        </StackItem>
        <StackItem>
          <Brand
            src={migrationIllustration}
            alt="Migration tool illustration"
            className="migration-tool-image"
          />
        </StackItem>
        <StackItem className="migration-phrase">
          <Trans t={t} ns="plugin__kubevirt-plugin">
            The Migration Toolkit for Virtualization Operator facilitates the migration of multiple
            virtual machine workloads to OpenShift Virtualization.
          </Trans>{' '}
          {!mtvLink && t('The Operator is installed from the OperatorHub.')}
        </StackItem>
        <StackItem>
          {mtvLink ? (
            <Button isInline variant="primary" href={mtvLink} target="_blank" component="a">
              {t('Open MTV')}
            </Button>
          ) : (
            <Button isInline variant="primary" onClick={goToOperatorPage}>
              {t('Install MTV')}
            </Button>
          )}
        </StackItem>
        <StackItem>
          <Button
            variant="link"
            icon={<ExternalLinkAltIcon />}
            href={MIGRATION_TOOL_DOCUMENTATION_URL}
            target="_blank"
            component="a"
            iconPosition="right"
            className="pf-u-pl-0"
          >
            {t('View documentation')}
          </Button>
        </StackItem>
      </Stack>
    </div>
  );
};

export default MigrationToolPage;
