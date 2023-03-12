import * as React from 'react';
import { Trans } from 'react-i18next';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  Button,
  ButtonVariant,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListTerm,
  DescriptionListTermHelpTextButton,
  Flex,
  Grid,
  GridItem,
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

import MigrationPolicyDescriptionItem from './components/MigrationPolicyDescriptionItem';
import MigrationPolicyProjectLabels from './components/MigrationPolicyProjectLabels';
import MigrationPolicyVirtualMachineLabels from './components/MigrationPolicyVirtualMachineLabels';

import './MigrationPolicyDetailsSection.scss';

type MigrationPolicyDetailsSectionProps = {
  mp: V1alpha1MigrationPolicy;
  pathname: string;
};

const MigrationPolicyDetailsSection: React.FC<MigrationPolicyDetailsSectionProps> = ({
  mp,
  pathname,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const hasOwnPropertySpec = (key: string) => key in (mp?.spec || {});

  return (
    <div>
      <a href={`${pathname}#details`} className="link-icon">
        <LinkIcon size="sm" />
      </a>
      <Title headingLevel="h2" className="kv-details-section-heading">
        {t('MigrationPolicy details')}
      </Title>
      <Grid hasGutter>
        <GridItem span={5}>
          <DescriptionList>
            <MigrationPolicyDescriptionItem
              title={t('Name')}
              description={mp?.metadata?.name}
              isPopover
              popoverContent={t(
                'Name must be unique within a namespace. Is required when creating resources, although some resources may allow a client to request the generation of an appropriate name automatically. Name is primarily intended for creation idempotence and configuration definition. ',
              )}
              moreInfoURL="http://kubernetes.io/docs/user-guide/identifiers#names"
              breadcrumb="MigrationPolicy.metadata.name"
            />
            <MigrationPolicyDescriptionItem
              title={t('Description')}
              description={mp?.metadata?.annotations?.description}
            />
            <>
              <DescriptionListTerm>
                <Button
                  isInline
                  onClick={() =>
                    createModal(({ isOpen, onClose }) => (
                      <MigrationPolicyEditModal isOpen={isOpen} onClose={onClose} mp={mp} />
                    ))
                  }
                  variant={ButtonVariant.link}
                >
                  <Flex spaceItems={{ default: 'spaceItemsNone' }}>
                    <Title headingLevel="h2">{t('Configurations')}</Title>
                    <PencilAltIcon className="kv-icon-space-l pf-c-button-icon--plain" />
                  </Flex>
                </Button>
              </DescriptionListTerm>

              <DescriptionListDescription>
                <DescriptionList>
                  <MigrationPolicyDescriptionItem
                    title={t('Bandwidth per migration')}
                    description={
                      hasOwnPropertySpec(migrationPolicySpecKeys.BANDWIDTH_PER_MIGRATION)
                        ? getBandwidthPerMigrationText(mp?.spec?.bandwidthPerMigration)
                        : NO_DATA_DASH
                    }
                    isPopover
                    popoverContent={t(
                      'BandwidthPerMigration limits the amount of network bandwith live migrations are allowed to use. The value is in quantity per second. Defaults to 0 (no limit). ',
                    )}
                    moreInfoURL="http://kubevirt.io/api-reference/main/definitions.html#_v1_migrationconfiguration"
                  />
                  <MigrationPolicyDescriptionItem
                    title={t('Auto converge')}
                    description={
                      hasOwnPropertySpec(migrationPolicySpecKeys.ALLOW_AUTO_CONVERGE)
                        ? getBooleanText(mp?.spec?.allowAutoConverge)
                        : NO_DATA_DASH
                    }
                    isPopover
                    popoverContent={t(
                      'AllowAutoConverge allows the platform to compromise performance/availability of VMIs to guarantee successful VMI live migrations. Defaults to false. ',
                    )}
                    moreInfoURL="http://kubevirt.io/api-reference/main/definitions.html#_v1_migrationconfiguration"
                  />
                  <MigrationPolicyDescriptionItem
                    title={t('Post-copy')}
                    description={
                      hasOwnPropertySpec(migrationPolicySpecKeys.ALLOW_POST_COPY)
                        ? getBooleanText(mp?.spec?.allowPostCopy)
                        : NO_DATA_DASH
                    }
                    isPopover
                    popoverContent={t(
                      'AllowPostCopy enables post-copy live migrations. Such migrations allow even the busiest VMIs to successfully live-migrate. However, events like a network failure can cause a VMI crash. If set to true, migrations will still start in pre-copy, but switch to post-copy when CompletionTimeoutPerGiB triggers. Defaults to false. ',
                    )}
                    moreInfoURL="http://kubevirt.io/api-reference/main/definitions.html#_v1_migrationconfiguration"
                  />
                  <MigrationPolicyDescriptionItem
                    title={t('Completion timeout')}
                    description={
                      hasOwnPropertySpec(migrationPolicySpecKeys.COMPLETION_TIMEOUT_PER_GIB)
                        ? getCompletionTimeoutText(mp?.spec?.completionTimeoutPerGiB)
                        : NO_DATA_DASH
                    }
                    isPopover
                    popoverContent={t(
                      'CompletionTimeoutPerGiB is the maximum number of seconds per GiB a migration is allowed to take. If a live-migration takes longer to migrate than this value multiplied by the size of the VMI, the migration will be cancelled, unless AllowPostCopy is true. Defaults to 800. ',
                    )}
                    moreInfoURL="http://kubevirt.io/api-reference/main/definitions.html#_v1_migrationconfiguration"
                  />
                </DescriptionList>
              </DescriptionListDescription>
            </>

            <Title headingLevel="h2">
              <Popover
                headerContent={t('Labels')}
                bodyContent={
                  <Trans ns="plugin__kubevirt-plugin">
                    Map of string keys and values that can be used to organize and categorize (scope
                    and select) objects. May match selectors of replication controllers and
                    services. More info:{' '}
                    <a href="http://kubernetes.io/docs/user-guide/labels">
                      http://kubernetes.io/docs/user-guide/labels
                    </a>
                  </Trans>
                }
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
