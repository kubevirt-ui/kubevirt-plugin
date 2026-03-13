import React, { FC, useCallback, useState } from 'react';

import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { Divider, Stack } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import { AUTOMATIC_IMAGE_DOWNLOAD_ANNOTATION } from './utils/consts';

type AutomaticImagesDownloadProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
  newBadge: boolean;
};

const AutomaticImagesDownload: FC<AutomaticImagesDownloadProps> = ({
  hyperConvergeConfiguration,
  newBadge,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const isAdmin = useIsAdmin();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageLoadingIndex, setImageLoadingIndex] = useState<number>(-1);

  const [hyperConverged, loaded] = hyperConvergeConfiguration;
  const isEnabledAutomaticImagesDownload =
    hyperConverged?.spec?.enableCommonBootImageImport !== undefined
      ? hyperConverged?.spec?.enableCommonBootImageImport
      : true;

  const bootSources =
    hyperConverged?.spec?.dataImportCronTemplates ||
    hyperConverged?.status?.dataImportCronTemplates;

  const onChangeAutomaticImagesDownload = useCallback(
    (val: boolean) => {
      setIsLoading(true);
      kubevirtK8sPatch({
        cluster,
        data: [
          {
            op: 'replace',
            path: `/spec/enableCommonBootImageImport`,
            value: val,
          },
        ],
        model: HyperConvergedModel,
        resource: hyperConverged,
      }).finally(() => setIsLoading(false));
    },
    [cluster, hyperConverged],
  );

  const onChangeDataImportCronTemplate = useCallback(
    (val: boolean, index: number) => {
      setImageLoadingIndex(index);
      const copyBootSources = bootSources.map((source, i) =>
        i === index
          ? {
              ...source,
              metadata: {
                ...source.metadata,
                annotations: {
                  ...source.metadata.annotations,
                  [AUTOMATIC_IMAGE_DOWNLOAD_ANNOTATION]: val.toString(),
                },
              },
            }
          : source,
      );
      kubevirtK8sPatch({
        cluster,
        data: [
          {
            op: hyperConverged?.spec?.dataImportCronTemplates ? 'replace' : 'add',
            path: `/spec/dataImportCronTemplates`,
            value: copyBootSources,
          },
        ],
        model: HyperConvergedModel,
        resource: hyperConverged,
      }).finally(() => setImageLoadingIndex(-1));
    },
    [bootSources, cluster, hyperConverged],
  );

  return (
    <ExpandSection
      searchItemId={CLUSTER_TAB_IDS.automaticImagesDownload}
      toggleText={t('Automatic images download')}
    >
      <Stack hasGutter>
        <SectionWithSwitch
          helpTextIconContent={(hide) => (
            <PopoverContentWithLightspeedButton
              content={t('Enable automatic images download and update')}
              hide={hide}
              obj={hyperConvergeConfiguration?.[0]}
              promptType={OLSPromptType.AUTO_IMAGE_DOWNLOADS}
            />
          )}
          dataTestID="auto-image-download"
          id="auto-image-download"
          isDisabled={!loaded || !isAdmin}
          isLoading={isLoading}
          newBadge={newBadge}
          switchIsOn={Boolean(isEnabledAutomaticImagesDownload)}
          title={t('Automatic images download')}
          turnOnSwitch={onChangeAutomaticImagesDownload}
        />
        {isEnabledAutomaticImagesDownload && (
          <>
            <Divider />
            {(bootSources || []).map((bootSource, index) => {
              const name = getName(bootSource);
              return (
                <SectionWithSwitch
                  switchIsOn={
                    bootSource.metadata.annotations[AUTOMATIC_IMAGE_DOWNLOAD_ANNOTATION] !== 'false'
                  }
                  dataTestID={`${name}-auto-image-download-switch`}
                  id={`${name}-auto-image-download-switch`}
                  inlineCheckbox
                  isLoading={index === imageLoadingIndex}
                  key={name}
                  newBadge={newBadge}
                  title={name}
                  turnOnSwitch={(checked) => onChangeDataImportCronTemplate(checked, index)}
                />
              );
            })}
          </>
        )}
      </Stack>
    </ExpandSection>
  );
};

export default AutomaticImagesDownload;
