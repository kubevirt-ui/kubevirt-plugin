import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  Button,
  ButtonVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListTerm,
  DescriptionListTermHelpTextButton,
  Grid,
  GridItem,
  Icon,
  Popover,
  Title,
} from '@patternfly/react-core';
import { LinkIcon, PencilAltIcon } from '@patternfly/react-icons';

import MigrationPolicyEditModal from '../../../../../components/MigrationPolicyEditModal/MigrationPolicyEditModal';
import { migrationPolicySpecKeys } from '../../../../../utils/constants';
import {
  getBandwidthPerMigrationText,
  getBooleanText,
  getCompletionTimeoutText,
} from '../../../../../utils/utils';

import MigrationPolicyProjectLabels from './components/MigrationPolicyProjectLabels';
import MigrationPolicyVirtualMachineLabels from './components/MigrationPolicyVirtualMachineLabels';

import './MigrationPolicyDetailsSection.scss';

type MigrationPolicyDetailsSectionProps = {
  mp: V1alpha1MigrationPolicy;
  pathname: string;
};

const MigrationPolicyDetailsSection: FC<MigrationPolicyDetailsSectionProps> = ({
  mp,
  pathname,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const isACMPage = useIsACMPage();
  const hasOwnPropertySpec = (key: string) => key in (mp?.spec || {});

  return (
    <div>
      <a className="link-icon" href={`${pathname}#details`}>
        <Icon size="sm">
          {' '}
          <LinkIcon />
        </Icon>
      </a>
      <Title className="kv-details-section-heading" headingLevel="h2">
        {t('MigrationPolicy details')}
      </Title>
      <Grid hasGutter>
        <GridItem span={5}>
          <DescriptionList>
            <VirtualMachineDescriptionItem
              bodyContent={t(
                'Name must be unique within a namespace. Is required when creating resources, although some resources may allow a client to request the generation of an appropriate name automatically. Name is primarily intended for creation idempotence and configuration definition. ',
              )}
              breadcrumb="MigrationPolicy.metadata.name"
              descriptionData={mp?.metadata?.name}
              descriptionHeader={t('Name')}
              isPopover
              moreInfoURL={documentationURL.NAME}
            />

            {isACMPage && (
              <VirtualMachineDescriptionItem
                descriptionData={mp?.cluster}
                descriptionHeader={t('Cluster')}
              />
            )}
            <VirtualMachineDescriptionItem
              descriptionData={mp?.metadata?.annotations?.description}
              descriptionHeader={t('Description')}
            />
            <>
              <DescriptionListTerm>
                <Button
                  onClick={() =>
                    createModal(({ isOpen, onClose }) => (
                      <MigrationPolicyEditModal isOpen={isOpen} mp={mp} onClose={onClose} />
                    ))
                  }
                  icon={<PencilAltIcon />}
                  iconPosition="end"
                  isInline
                  size="lg"
                  variant={ButtonVariant.link}
                >
                  <Title headingLevel="h2">{t('Configurations')}</Title>
                </Button>
              </DescriptionListTerm>

              <DescriptionListDescription>
                <DescriptionList>
                  <VirtualMachineDescriptionItem
                    bodyContent={t(
                      'BandwidthPerMigration limits the amount of network bandwith live migrations are allowed to use. The value is in quantity per second. Defaults to 0 (no limit). ',
                    )}
                    descriptionData={
                      hasOwnPropertySpec(migrationPolicySpecKeys.BANDWIDTH_PER_MIGRATION)
                        ? getBandwidthPerMigrationText(mp?.spec?.bandwidthPerMigration)
                        : NO_DATA_DASH
                    }
                    descriptionHeader={t('Bandwidth per migration')}
                    isPopover
                    moreInfoURL={documentationURL.MIGRATION_CONFIGURATION}
                  />
                  <VirtualMachineDescriptionItem
                    bodyContent={t(
                      'AllowAutoConverge allows the platform to compromise performance/availability of VMIs to guarantee successful VMI live migrations. Defaults to false. ',
                    )}
                    descriptionData={
                      hasOwnPropertySpec(migrationPolicySpecKeys.ALLOW_AUTO_CONVERGE)
                        ? getBooleanText(mp?.spec?.allowAutoConverge)
                        : NO_DATA_DASH
                    }
                    descriptionHeader={t('Auto converge')}
                    isPopover
                    moreInfoURL={documentationURL.MIGRATION_CONFIGURATION}
                  />
                  <VirtualMachineDescriptionItem
                    bodyContent={t(
                      'AllowPostCopy enables post-copy live migrations. Such migrations allow even the busiest VMIs to successfully live-migrate. However, events like a network failure can cause a VMI crash. If set to true, migrations will still start in pre-copy, but switch to post-copy when CompletionTimeoutPerGiB triggers. Defaults to false. ',
                    )}
                    descriptionData={
                      hasOwnPropertySpec(migrationPolicySpecKeys.ALLOW_POST_COPY)
                        ? getBooleanText(mp?.spec?.allowPostCopy)
                        : NO_DATA_DASH
                    }
                    descriptionHeader={t('Post-copy')}
                    isPopover
                    moreInfoURL={documentationURL.MIGRATION_CONFIGURATION}
                  />
                  <VirtualMachineDescriptionItem
                    bodyContent={t(
                      'CompletionTimeoutPerGiB is the maximum number of seconds per GiB a migration is allowed to take. If a live-migration takes longer to migrate than this value multiplied by the size of the VMI, the migration will be cancelled, unless AllowPostCopy is true. Defaults to 800. ',
                    )}
                    descriptionData={
                      hasOwnPropertySpec(migrationPolicySpecKeys.COMPLETION_TIMEOUT_PER_GIB)
                        ? getCompletionTimeoutText(mp?.spec?.completionTimeoutPerGiB)
                        : NO_DATA_DASH
                    }
                    descriptionHeader={t('Completion timeout')}
                    isPopover
                    moreInfoURL={documentationURL.MIGRATION_CONFIGURATION}
                  />
                </DescriptionList>
              </DescriptionListDescription>
            </>

            <Title headingLevel="h2">
              <Popover
                bodyContent={
                  <>
                    <Trans ns="plugin__kubevirt-plugin">
                      Map of string keys and values that can be used to organize and categorize
                      (scope and select) objects. May match selectors of replication controllers and
                      services. More info:
                    </Trans>{' '}
                    <a href={documentationURL.LABELS}>{documentationURL.LABELS}</a>
                  </>
                }
                headerContent={t('Labels')}
              >
                <DescriptionListTermHelpTextButton>{t('Labels')}</DescriptionListTermHelpTextButton>
              </Popover>
            </Title>
            <MigrationPolicyProjectLabels mp={mp} />
            <MigrationPolicyVirtualMachineLabels mp={mp} />
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default MigrationPolicyDetailsSection;
