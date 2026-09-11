import { type FC, type ReactNode } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type SubscriptionKind } from '@overview/utils/types';
import {
  Alert,
  AlertVariant,
  DescriptionList,
  Divider,
  Skeleton,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import SettingsLink from '@settings/context/SettingsLink';

import SourceMissingStatus from './components/SourceMissingStatus';
import SubscriptionStatus from './components/SubscriptionStatus';

import './general-information.scss';

type GeneralInformationProps = {
  catalogSourceMissing: boolean;
  kubevirtSubscription: SubscriptionKind;
  loaded: boolean;
  loadErrors: Error[];
  operatorLink: string;
  updateChannel: string;
  version: string;
};

const GeneralInformation: FC<GeneralInformationProps> = ({
  catalogSourceMissing,
  kubevirtSubscription,
  loaded,
  loadErrors,
  operatorLink,
  updateChannel,
  version,
}) => {
  const { t } = useKubevirtTranslation();

  const getUpdateStatusContent = (): ReactNode => {
    if (!loaded) return <Skeleton />;
    if (catalogSourceMissing) return <SourceMissingStatus />;
    return <SubscriptionStatus operatorLink={operatorLink} subscription={kubevirtSubscription} />;
  };

  return (
    <Split className="general-tab" hasGutter>
      <SplitItem>
        <DescriptionList>
          <DescriptionItem
            data-test="general-information-installed-version"
            descriptionData={loaded ? version : <Skeleton />}
            descriptionHeader={t('Installed version')}
          />
        </DescriptionList>
      </SplitItem>
      <Divider orientation={{ default: 'vertical' }} />
      <SplitItem>
        <DescriptionList>
          <DescriptionItem
            data-test="general-information-update-status"
            descriptionData={getUpdateStatusContent()}
            descriptionHeader={t('Update status')}
          />
        </DescriptionList>
      </SplitItem>
      <Divider orientation={{ default: 'vertical' }} />
      <SplitItem>
        <DescriptionList>
          <DescriptionItem
            bodyContent={t('The channel to track and receive the updates from.')}
            descriptionData={
              loaded ? (
                <SettingsLink showExternalIcon to={operatorLink}>
                  {updateChannel}
                </SettingsLink>
              ) : (
                <Skeleton />
              )
            }
            descriptionHeader={t('Channel')}
            isPopover
          />
        </DescriptionList>
      </SplitItem>
      {!isEmpty(loadErrors) && loaded && (
        <Alert
          className="live-migration-tab--error"
          isInline
          title={t('Error')}
          variant={AlertVariant.danger}
        >
          {loadErrors.toString()}
        </Alert>
      )}
    </Split>
  );
};

export default GeneralInformation;
