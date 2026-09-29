import { type FC, useCallback, useState } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getHyperConvergedModelFromResource } from '@kubevirt-utils/resources/hyperconverged/model';
import {
  buildHyperConvergedPatch,
  getDataImportCronTemplatesPatchPath,
  getEnableCommonBootImageImportPatchPath,
} from '@kubevirt-utils/resources/hyperconverged/patchUtils';
import {
  getDataImportCronTemplates,
  getEnableCommonBootImageImport,
  getSpecDataImportCronTemplates,
} from '@kubevirt-utils/resources/hyperconverged/selectors';
import { getName } from '@kubevirt-utils/resources/shared';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { Divider, Stack } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import { type HyperConvergeConfigurationWatch } from '../../../consts/consts';
import { AUTOMATIC_IMAGE_DOWNLOAD_ANNOTATION } from './utils/consts';

type AutomaticImagesDownloadProps = {
  hyperConvergeConfiguration: HyperConvergeConfigurationWatch;
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
  const isEnabledAutomaticImagesDownload = getEnableCommonBootImageImport(hyperConverged) ?? true;

  const bootSources = getDataImportCronTemplates(hyperConverged);

  const onChangeAutomaticImagesDownload = useCallback(
    (val: boolean) => {
      setIsLoading(true);
      void kubevirtK8sPatch({
        cluster,
        data: buildHyperConvergedPatch(hyperConverged, {
          op: 'replace',
          path: getEnableCommonBootImageImportPatchPath(hyperConverged),
          value: val,
        }),
        model: getHyperConvergedModelFromResource(hyperConverged),
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
      void kubevirtK8sPatch({
        cluster,
        data: buildHyperConvergedPatch(hyperConverged, {
          op: getSpecDataImportCronTemplates(hyperConverged) ? 'replace' : 'add',
          path: getDataImportCronTemplatesPatchPath(hyperConverged),
          value: copyBootSources,
        }),
        model: getHyperConvergedModelFromResource(hyperConverged),
        resource: hyperConverged,
      }).finally(() => setImageLoadingIndex(-1));
    },
    [bootSources, cluster, hyperConverged],
  );

  return (
    <ExpandSection
      dataTestID="automatic-images-download"
      searchItemId={CLUSTER_TAB_IDS.automaticImagesDownload}
      toggleText={t('Automatic images download')}
    >
      <Stack hasGutter>
        <SectionWithSwitch
          dataTestID="auto-image-download"
          helpTextIconContent={t('Enable automatic images download and update')}
          id="auto-image-download"
          isDisabled={!loaded || !isAdmin}
          isLoading={isLoading}
          newBadge={newBadge}
          olsPromptType={OLSPromptType.AUTO_IMAGE_DOWNLOADS}
          switchIsOn={Boolean(isEnabledAutomaticImagesDownload)}
          title={t('Automatic images download')}
          turnOnSwitch={onChangeAutomaticImagesDownload}
        />
        {isEnabledAutomaticImagesDownload && (
          <>
            <Divider />
            {(bootSources ?? []).map((bootSource, index) => {
              const name = getName(bootSource);
              return (
                <SectionWithSwitch
                  dataTestID={`${name}-auto-image-download-switch`}
                  id={`${name}-auto-image-download-switch`}
                  inlineCheckbox
                  isLoading={index === imageLoadingIndex}
                  key={name}
                  newBadge={newBadge}
                  switchIsOn={
                    bootSource.metadata.annotations[AUTOMATIC_IMAGE_DOWNLOAD_ANNOTATION] !== 'false'
                  }
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
