import React, { FC, useState } from 'react';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { getName } from '@kubevirt-utils/resources/shared';
import { Alert, Flex, FlexItem, FormGroup } from '@patternfly/react-core';

import { useTLSCertConfigMaps } from '../hooks/useTLSCertConfigMaps';

type ExistingTLSCertificateProps = {
  cluster?: string;
  namespace: string;
  onChange: (namespace: string, configMapName: string) => void;
};

const ExistingTLSCertificate: FC<ExistingTLSCertificateProps> = ({
  cluster,
  namespace,
  onChange,
}) => {
  const { t } = useKubevirtTranslation();

  const [certProject, setCertProject] = useState(namespace);
  const [selectedConfigMap, setSelectedConfigMap] = useState('');

  const [projectNames, projectsLoaded] = useProjects(cluster);
  const [tlsCertConfigMaps, certMapsLoaded, certMapsError] = useTLSCertConfigMaps(
    certProject,
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
                setCertProject(name);
                setSelectedConfigMap('');
                onChange(name, '');
              }}
              toggleProps={{
                isFullWidth: true,
                placeholder: t('Select project...'),
              }}
              selected={certProject || ''}
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
              setSelected={(name: string) => {
                setSelectedConfigMap(name);
                onChange(certProject, name);
              }}
              toggleProps={{
                isFullWidth: true,
                placeholder: t('Select TLS certificate'),
              }}
              selected={selectedConfigMap || ''}
            />
          )}
          {!certMapsError && !certMapsLoaded && <Loading />}
        </FormGroup>
      </FlexItem>
    </Flex>
  );
};

export default ExistingTLSCertificate;
