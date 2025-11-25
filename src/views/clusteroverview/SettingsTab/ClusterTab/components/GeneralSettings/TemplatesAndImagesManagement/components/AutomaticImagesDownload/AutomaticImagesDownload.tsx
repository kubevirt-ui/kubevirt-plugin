import React, { FC, useCallback, useState } from 'react';

import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import LightspeedSimplePopoverContent from '@lightspeed/components/LightspeedSimplePopoverContent';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { CLUSTER_TAB_IDS } from '@overview/SettingsTab/search/constants';
import { Divider, Stack } from '@patternfly/react-core';

import ExpandSection from '../../../../../../ExpandSection/ExpandSection';

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
      k8sPatch({
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
    [hyperConverged],
  );

  const onChangeDataImportCronTemplate = useCallback(
    (val: boolean, index: number) => {
      setImageLoadingIndex(index);
      const copyBootSources = [...bootSources];
      copyBootSources[index].metadata.annotations = {
        ...copyBootSources[index].metadata.annotations,
        [AUTOMATIC_IMAGE_DOWNLOAD_ANNOTATION]: val.toString(),
      };
      k8sPatch({
        data: [
          {
            op: 'replace',
            path: `/spec`,
            value: { dataImportCronTemplates: copyBootSources },
          },
        ],
        model: HyperConvergedModel,
        resource: hyperConverged,
      }).finally(() => setImageLoadingIndex(-1));
    },
    [bootSources, hyperConverged],
  );

  return (
    <ExpandSection
      searchItemId={CLUSTER_TAB_IDS.automaticImagesDownload}
      toggleText={t('Automatic images download')}
    >
      <Stack hasGutter>
        <SectionWithSwitch
          helpTextIconContent={(hide) => (
            <LightspeedSimplePopoverContent
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
