import React, { FC, useEffect } from 'react';

import {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
  TLS_CERT_FIELD_NAMES,
  TLS_CERT_SOURCE_EXISTING,
  TLS_CERT_SOURCE_NEW,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Checkbox,
  Flex,
  FlexItem,
  FormGroup,
  Radio,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import TlsCertificateExisting from './TlsCertificateExisting';
import TlsCertificateNew from './TlsCertificateNew';

type TlsCertificateSectionProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const TlsCertificateSection: FC<TlsCertificateSectionProps> = ({
  bootableVolume,
  setBootableVolumeField,
}) => {
  const { t } = useKubevirtTranslation();
  const targetNamespace = bootableVolume?.bootableVolumeNamespace;
  const { tlsCertificateRequired, tlsCertProject, tlsCertSource } = bootableVolume || {};

  useEffect(() => {
    if (!tlsCertProject && targetNamespace) {
      setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertProject)(targetNamespace);
    }
  }, [targetNamespace, tlsCertProject, setBootableVolumeField]);

  const tlsRequired = !!tlsCertificateRequired;
  const useExisting = tlsCertSource === TLS_CERT_SOURCE_EXISTING;

  return (
    <FormGroup
      className="disk-source-form-group"
      fieldId="tls-certificate"
      label={t('TLS certificate')}
    >
      <Stack hasGutter>
        <StackItem>
          <Checkbox
            onChange={(_event, checked) => {
              setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertificateRequired)(checked);
              if (checked) {
                setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertSource)(
                  TLS_CERT_SOURCE_EXISTING,
                );
              }
            }}
            id="tls-certificate-required"
            isChecked={tlsRequired}
            label={t('TLS certificate required')}
          />
        </StackItem>
        {tlsRequired && (
          <StackItem style={{ marginLeft: 'var(--pf-v5-global--spacer--md)' }}>
            <Stack hasGutter>
              <StackItem>
                <Flex direction={{ default: 'row' }} gap={{ default: 'gapLg' }}>
                  <FlexItem>
                    <Radio
                      onChange={() => {
                        setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertSource)(
                          TLS_CERT_SOURCE_EXISTING,
                        );
                        setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertificate)('');
                      }}
                      id="tls-use-existing"
                      isChecked={useExisting}
                      label={t('Use existing')}
                      name="tls-cert-source"
                    />
                  </FlexItem>
                  <FlexItem>
                    <Radio
                      onChange={() => {
                        setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertSource)(
                          TLS_CERT_SOURCE_NEW,
                        );
                        setBootableVolumeField(TLS_CERT_FIELD_NAMES.tlsCertConfigMapName)('');
                      }}
                      id="tls-add-new"
                      isChecked={!useExisting}
                      label={t('Add new')}
                      name="tls-cert-source"
                    />
                  </FlexItem>
                </Flex>
              </StackItem>
              {useExisting ? (
                <StackItem>
                  <TlsCertificateExisting
                    bootableVolume={bootableVolume}
                    setBootableVolumeField={setBootableVolumeField}
                  />
                </StackItem>
              ) : (
                <StackItem>
                  <TlsCertificateNew
                    bootableVolume={bootableVolume}
                    setBootableVolumeField={setBootableVolumeField}
                  />
                </StackItem>
              )}
            </Stack>
          </StackItem>
        )}
      </Stack>
    </FormGroup>
  );
};

export default TlsCertificateSection;
