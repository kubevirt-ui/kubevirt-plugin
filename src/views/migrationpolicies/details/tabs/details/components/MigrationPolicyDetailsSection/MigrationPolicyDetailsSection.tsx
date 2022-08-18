import * as React from 'react';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListTermHelpTextButton,
  Flex,
  FlexItem,
  Grid,
  GridItem,
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
            <MigrationPolicyDescriptionItem title={t('Name')} description={mp?.metadata?.name} />
            <>
              <DescriptionListTermHelpTextButton
                onClick={() =>
                  createModal(({ isOpen, onClose }) => (
                    <MigrationPolicyEditModal isOpen={isOpen} onClose={onClose} mp={mp} />
                  ))
                }
              >
                <Flex spaceItems={{ default: 'spaceItemsNone' }}>
                  <FlexItem>
                    <Title headingLevel="h2">{t('Configurations')}</Title>
                  </FlexItem>
                  <FlexItem>
                    <PencilAltIcon className="kv-icon-space-l" />
                  </FlexItem>
                </Flex>
              </DescriptionListTermHelpTextButton>
              <DescriptionListDescription>
                <DescriptionList>
                  <MigrationPolicyDescriptionItem
                    title={t('Bandwidth per migration')}
                    description={
                      hasOwnPropertySpec(migrationPolicySpecKeys.BANDWIDTH_PER_MIGRATION)
                        ? getBandwidthPerMigrationText(mp?.spec?.bandwidthPerMigration)
                        : NO_DATA_DASH
                    }
                  />
                  <MigrationPolicyDescriptionItem
                    title={t('Auto converge')}
                    description={
                      hasOwnPropertySpec(migrationPolicySpecKeys.ALLOW_AUTO_CONVERGE)
                        ? getBooleanText(mp?.spec?.allowAutoConverge)
                        : NO_DATA_DASH
                    }
                  />
                  <MigrationPolicyDescriptionItem
                    title={t('Post-copy')}
                    description={
                      hasOwnPropertySpec(migrationPolicySpecKeys.ALLOW_POST_COPY)
                        ? getBooleanText(mp?.spec?.allowPostCopy)
                        : NO_DATA_DASH
                    }
                  />
                  <MigrationPolicyDescriptionItem
                    title={t('Completion timeout')}
                    description={
                      hasOwnPropertySpec(migrationPolicySpecKeys.COMPLETION_TIMEOUT_PER_GIB)
                        ? getCompletionTimeoutText(mp?.spec?.completionTimeoutPerGiB)
                        : NO_DATA_DASH
                    }
                  />
                </DescriptionList>
              </DescriptionListDescription>
            </>
            <Title headingLevel="h2">{t('Labels')}</Title>
            <MigrationPolicyProjectLabels mp={mp} />
            <MigrationPolicyVirtualMachineLabels mp={mp} />
          </DescriptionList>
        </GridItem>
      </Grid>
    </div>
  );
};

export default MigrationPolicyDetailsSection;
