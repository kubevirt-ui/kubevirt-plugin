import React, { FC, useCallback } from 'react';

import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Divider } from '@patternfly/react-core';

import ExpandSection from '../../../../ExpandSection/ExpandSection';

import { AUTOMATIC_IMAGE_DOWNLOAD_ANNOTATION } from './utils/consts';

import './automatic-images-download.scss';

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

  const [hyperConverged, loaded] = hyperConvergeConfiguration;
  const isEnabledAutomaticImagesDownload =
    hyperConverged?.spec?.featureGates?.enableCommonBootImageImport;
  const bootSources =
    hyperConverged?.spec?.dataImportCronTemplates ||
    hyperConverged?.status?.dataImportCronTemplates;

  const onChangeAutomaticImagesDownload = useCallback(
    (val: boolean) => {
      k8sPatch({
        data: [
          {
            op: 'replace',
            path: `/spec/featureGates/enableCommonBootImageImport`,
            value: val,
          },
        ],
        model: HyperConvergedModel,
        resource: hyperConverged,
      });
    },
    [hyperConverged],
  );

  const onChangeDataImportCronTemplate = useCallback(
    (val: boolean, index: number) => {
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
      });
    },
    [bootSources, hyperConverged],
  );

  return (
    <ExpandSection toggleText={t('Automatic images download')}>
      <SectionWithSwitch
        helpTextIconContent={t('Enable automatic images download and update')}
        id="auto-image-download"
        isDisabled={!loaded || !isAdmin || isEnabledAutomaticImagesDownload === undefined}
        newBadge={newBadge}
        switchIsOn={Boolean(isEnabledAutomaticImagesDownload)}
        title={t('Automatic images download')}
        turnOnSwitch={onChangeAutomaticImagesDownload}
      />
      {isEnabledAutomaticImagesDownload && (
        <>
          <Divider className="AutomaticImagesDownload--divider" />
          {(bootSources || []).map((bootSource, index) => {
            const name = getName(bootSource);
            return (
              <SectionWithSwitch
                switchIsOn={
                  bootSource.metadata.annotations[AUTOMATIC_IMAGE_DOWNLOAD_ANNOTATION] !== 'false'
                }
                id={`${name}-auto-image-download-switch`}
                inlineCheckbox
                key={name}
                newBadge={newBadge}
                title={name}
                turnOnSwitch={(checked) => onChangeDataImportCronTemplate(checked, index)}
              />
            );
          })}
        </>
      )}
    </ExpandSection>
  );
};

export default AutomaticImagesDownload;
