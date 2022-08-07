import * as React from 'react';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
              <DescriptionListTermHelpTextButton /*onClick={Open editconfigmodal}*/>
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
                    description={getBandwidthPerMigrationText(mp?.spec?.bandwidthPerMigration)}
                  />

                  <MigrationPolicyDescriptionItem
                    title={t('Auto converge')}
                    description={getBooleanText(mp?.spec?.allowAutoConverge)}
                  />

                  <MigrationPolicyDescriptionItem
                    title={t('Post-copy')}
                    description={getBooleanText(mp?.spec?.allowPostCopy)}
                  />

                  <MigrationPolicyDescriptionItem
                    title={t('Completion timeout')}
                    description={getCompletionTimeoutText(mp?.spec?.completionTimeoutPerGiB)}
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
