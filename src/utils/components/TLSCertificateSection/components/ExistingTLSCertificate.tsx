import React, { FC } from 'react';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useNamespaces from '@kubevirt-utils/hooks/useNamespaces';
import { getName } from '@kubevirt-utils/resources/shared';
import { Alert, Flex, FlexItem, FormGroup } from '@patternfly/react-core';

import { useTLSCertConfigMaps } from '../hooks/useTLSCertConfigMaps';

type ExistingTLSCertificateProps = {
  cluster?: string;
  namespace: string;
  onChange: (namespace: string, configMapName: string) => void;
  selectedConfigMapName?: null | string;
  selectedNamespace?: null | string;
};

const ExistingTLSCertificate: FC<ExistingTLSCertificateProps> = ({
  cluster,
  namespace,
  onChange,
  selectedConfigMapName,
  selectedNamespace,
}) => {
  const { t } = useKubevirtTranslation();

  const certNamespace = selectedNamespace || namespace;
  const selectedConfigMap = selectedConfigMapName || '';

  const [namespaceNames, namespacesLoaded] = useNamespaces(cluster);
  const [tlsCertConfigMaps, certMapsLoaded, certMapsError] = useTLSCertConfigMaps(
    certNamespace,
    cluster,
  );

  return (
    <Flex direction={{ default: 'row' }} gap={{ default: 'gapMd' }}>
      <FlexItem grow={{ default: 'grow' }}>
        <FormGroup label={t('Namespace')}>
          {namespacesLoaded ? (
            <InlineFilterSelect
              options={namespaceNames?.map((name) => ({
                children: name,
                value: name,
              }))}
              setSelected={(name: string) => {
                onChange(name, '');
              }}
              toggleProps={{
                isFullWidth: true,
              }}
              placeholder={t('Select namespace...')}
              selected={certNamespace || ''}
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
                onChange(certNamespace, name);
              }}
              toggleProps={{
                isFullWidth: true,
              }}
              placeholder={t('Select TLS certificate')}
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
