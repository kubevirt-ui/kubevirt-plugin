import React, { FC } from 'react';

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

import ExistingTLSCertificate from './components/ExistingTLSCertificate';
import NewTLSCertificate from './components/NewTLSCertificate';
import { TLS_CERT_SOURCE_EXISTING, TLS_CERT_SOURCE_NEW, TLSCertSourceType } from './constants';

type TLSCertificateSectionProps = {
  cluster?: string;
  namespace: string;
  onExistingCertificateChange: (namespace: string, configMapName: string) => void;
  onNewCertificateChange: (certificate: string) => void;
  onRequiredChange: (required: boolean) => void;
  onSourceChange: (source: TLSCertSourceType) => void;
  tlsCertificate?: string;
  tlsCertificateRequired?: boolean;
  tlsCertSource?: TLSCertSourceType;
};

const TLSCertificateSection: FC<TLSCertificateSectionProps> = ({
  cluster,
  namespace,
  onExistingCertificateChange,
  onNewCertificateChange,
  onRequiredChange,
  onSourceChange,
  tlsCertificate,
  tlsCertificateRequired,
  tlsCertSource,
}) => {
  const { t } = useKubevirtTranslation();

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
              onRequiredChange(checked);
              if (checked) {
                onSourceChange(TLS_CERT_SOURCE_EXISTING);
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
                        onSourceChange(TLS_CERT_SOURCE_EXISTING);
                        onNewCertificateChange('');
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
                        onSourceChange(TLS_CERT_SOURCE_NEW);
                        onExistingCertificateChange('', '');
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
                  <ExistingTLSCertificate
                    cluster={cluster}
                    namespace={namespace}
                    onChange={onExistingCertificateChange}
                  />
                </StackItem>
              ) : (
                <StackItem>
                  <NewTLSCertificate
                    onChange={onNewCertificateChange}
                    tlsCertificate={tlsCertificate}
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

export default TLSCertificateSection;
