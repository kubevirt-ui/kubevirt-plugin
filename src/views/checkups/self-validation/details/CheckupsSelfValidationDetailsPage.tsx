import type { FC } from 'react';
import { useMemo } from 'react';

import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import useHideYamlTab, { removeYamlTabs } from '@kubevirt-utils/hooks/useHideYamlTab';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';

import CheckupsNotFound from '../../components/CheckupsNotFound';
import CheckupsSelfValidationDetailsPageHeader from './CheckupsSelfValidationDetailsPageHeader';
import { useCheckupsSelfValidationTabs } from './hooks/useCheckupsSelfValidationTabs';
import useWatchCheckupData from './hooks/useWatchCheckupData';

import './checkups-self-validation-details-page.scss';

const CheckupsSelfValidationDetailsPage: FC = () => {
  const { configMap, error, jobMatches, loaded } = useWatchCheckupData();

  const pages = useCheckupsSelfValidationTabs();
  const { hideYamlTab } = useHideYamlTab();
  const filteredPages = useMemo(() => removeYamlTabs(pages, hideYamlTab), [pages, hideYamlTab]);
  const notFound = !configMap && loaded;

  return (
    <StateHandler error={error} hasData={!!configMap} loaded={loaded} withBullseye>
      <CheckupsSelfValidationDetailsPageHeader configMap={configMap} jobs={jobMatches} />
      {configMap && <HorizontalNav pages={filteredPages} />}
      {notFound && <CheckupsNotFound />}
    </StateHandler>
  );
};

export default CheckupsSelfValidationDetailsPage;
