import { type JSX } from 'react';
import { Trans } from 'react-i18next';

import { MigrationPolicyModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItemName from '@kubevirt-utils/components/DescriptionItem/components/DescriptionItemName';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
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
import MigrationPolicyProjectLabels from './components/MigrationPolicyProjectLabels';
import MigrationPolicyVirtualMachineLabels from './components/MigrationPolicyVirtualMachineLabels';
import MigrationPolicyConfigurations from './MigrationPolicyConfigurations';

import './MigrationPolicyDetailsSection.scss';

type MigrationPolicyDetailsSectionProps = {
  mp: V1alpha1MigrationPolicy;
  pathname: string;
};

const MigrationPolicyDetailsSection = ({
  mp,
  pathname,
}: MigrationPolicyDetailsSectionProps): JSX.Element => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const isACMPage = useIsACMPage();

  const onEditConfigurations = (): void => {
    Promise.resolve(
      createModal?.(
        ({ isOpen, onClose }): JSX.Element => (
          <MigrationPolicyEditModal isOpen={isOpen} mp={mp} onClose={onClose} />
        ),
      ),
    ).catch(kubevirtConsole.error);
  };

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
            <DescriptionItemName model={MigrationPolicyModel} resource={mp} />

            {isACMPage && (
              <DescriptionItem descriptionData={mp?.cluster} descriptionHeader={t('Cluster')} />
            )}
            <DescriptionItem
              descriptionData={mp?.metadata?.annotations?.description}
              descriptionHeader={t('Description')}
            />
            <>
              <DescriptionListTerm>
                <Button
                  icon={<PencilAltIcon />}
                  iconPosition="end"
                  isInline
                  onClick={onEditConfigurations}
                  size="lg"
                  variant={ButtonVariant.link}
                >
                  <Title headingLevel="h2">{t('Configurations')}</Title>
                </Button>
              </DescriptionListTerm>

              <DescriptionListDescription>
                <MigrationPolicyConfigurations mp={mp} />
              </DescriptionListDescription>
            </>

            <Title headingLevel="h2">
              <Popover
                bodyContent={(hide: () => void): JSX.Element => (
                  <PopoverContentWithLightspeedButton
                    content={
                      <>
                        <Trans ns="plugin__kubevirt-plugin">
                          Map of string keys and values that can be used to organize and categorize
                          (scope and select) objects. May match selectors of replication controllers
                          and services. More info:
                        </Trans>{' '}
                        <a href={documentationURL.LABELS}>{documentationURL.LABELS}</a>
                      </>
                    }
                    hide={hide}
                    obj={mp}
                    promptType={OLSPromptType.LABELS}
                  />
                )}
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
