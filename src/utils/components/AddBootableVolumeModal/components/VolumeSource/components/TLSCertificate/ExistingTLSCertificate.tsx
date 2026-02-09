import React, { FC } from 'react';

import { useTLSCertConfigMaps } from '@kubevirt-utils/components/AddBootableVolumeModal/hooks/useTLSCertConfigMaps';
import {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
  TLS_CERT_FIELD_NAMES,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { getName } from '@kubevirt-utils/resources/shared';
import { Alert, Flex, FlexItem, FormGroup } from '@patternfly/react-core';

type ExistingTLSCertificateProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const ExistingTLSCertificate: FC<ExistingTLSCertificateProps> = ({
  bootableVolume,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();

  const cluster = bootableVolume?.bootableVolumeCluster;
  const tlsCertProject = bootableVolume?.tlsCertProject || bootableVolume?.bootableVolumeNamespace;
  const [projectNames, projectsLoaded] = useProjects(cluster);
  const [tlsCertConfigMaps, certMapsLoaded, certMapsError] = useTLSCertConfigMaps(
    tlsCertProject,
    cluster,
  );

  return (
    <Flex direction={{ default: 'row' }} gap={{ default: 'gapMd' }}>
      <FlexItem grow={{ default: 'grow' }}>
        <FormGroup label={t('Project')}>
          {projectsLoaded ? (
            <InlineFilterSelect
              options={projectNames?.map((name) => ({
                children: name,
                value: name,
              }))}
              setSelected={(name: string) => {
                setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertProject)(name);
                setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertConfigMapName)('');
              }}
              toggleProps={{
                isFullWidth: true,
                placeholder: t('Select project...'),
              }}
              selected={tlsCertProject || ''}
            />
          ) : (
            <Loading />
          )}
        </FormGroup>
      </FlexItem>
      <FlexItem grow={{ default: 'grow' }}>
        <FormGroup label={t('TLS certificate')}>
          {certMapsError && (
            <Alert isInline title={t('Failed to load TLS certificates')} variant="danger" />
          )}
          {!certMapsError && certMapsLoaded && (
            <InlineFilterSelect
              options={tlsCertConfigMaps?.map((cm) => {
                const name = getName(cm);
                return { children: name, value: name };
              })}
              setSelected={(name: string) =>
                setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertConfigMapName)(name)
              }
              toggleProps={{
                isFullWidth: true,
                placeholder: t('Select TLS certificate'),
              }}
              selected={bootableVolume?.tlsCertConfigMapName || ''}
            />
          )}
          {!certMapsError && !certMapsLoaded && <Loading />}
        </FormGroup>
      </FlexItem>
    </Flex>
  );
};

export default ExistingTLSCertificate;
