import React, { FC, FormEventHandler } from 'react';
import { useFormContext } from 'react-hook-form';

import { useDrawerContext } from '@catalog/templatescatalog/components/TemplatesCatalogDrawer/hooks/useDrawerContext';
import FormGroupHelperText from '@kubevirt-utils/components/FormGroupHelperText/FormGroupHelperText';
import { FormTextInput } from '@kubevirt-utils/components/FormTextInput/FormTextInput';
import { TLSCertificateSection } from '@kubevirt-utils/components/TLSCertificateSection';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { FormGroup, ValidatedOptions } from '@patternfly/react-core';

import { HTTP_SOURCE_NAME } from '../../constants';

type HTTPSourceProps = {
  httpSourceHelperURL: string;
  onInputValueChange: FormEventHandler<HTMLInputElement>;
  testId: string;
};

const HTTPSource: FC<HTTPSourceProps> = ({ httpSourceHelperURL, onInputValueChange, testId }) => {
  const { t } = useKubevirtTranslation();
  const activeNamespace = useActiveNamespace();
  const namespace = getValidNamespace(activeNamespace);
  const cluster = useClusterParam();
  const { setTLSCertState, tlsCertState } = useDrawerContext();

  const {
    formState: { errors },
    register,
  } = useFormContext();

  return (
    <>
      <FormGroup
        className="disk-source-form-group"
        fieldId={`${testId}-${HTTP_SOURCE_NAME}`}
        isRequired
        label={t('Image URL')}
      >
        <FormTextInput
          {...register(`${testId}-httpURL`, { required: true })}
          validated={
            errors?.[`${testId}-httpURL`] ? ValidatedOptions.error : ValidatedOptions.default
          }
          aria-label={t('Image URL')}
          data-test-id={`${testId}-http-source-input`}
          id={`${testId}-${HTTP_SOURCE_NAME}`}
          onChange={onInputValueChange}
          type="text"
        />
        <FormGroupHelperText
          validated={
            errors?.[`${testId}-httpURL`] ? ValidatedOptions.error : ValidatedOptions.default
          }
        >
          {errors?.[`${testId}-httpURL`]
            ? t('This field is required')
            : httpSourceHelperURL && (
                <>
                  {t('Enter URL to download. For example: ')}
                  <a href={httpSourceHelperURL} rel="noreferrer" target="_blank">
                    {httpSourceHelperURL}
                  </a>
                </>
              )}
        </FormGroupHelperText>
      </FormGroup>

      <TLSCertificateSection
        onExistingCertificateChange={(certNamespace, configMapName) =>
          setTLSCertState({
            tlsCertConfigMapName: configMapName,
            tlsCertificate: null,
            tlsCertProject: certNamespace,
          })
        }
        onNewCertificateChange={(certificate) =>
          setTLSCertState({
            tlsCertConfigMapName: null,
            tlsCertificate: certificate,
            tlsCertProject: null,
          })
        }
        cluster={cluster}
        namespace={namespace}
        onRequiredChange={(required) => setTLSCertState({ tlsCertificateRequired: required })}
        onSourceChange={(source) => setTLSCertState({ tlsCertSource: source })}
        tlsCertificate={tlsCertState.tlsCertificate}
        tlsCertificateRequired={tlsCertState.tlsCertificateRequired}
        tlsCertSource={tlsCertState.tlsCertSource}
      />
    </>
  );
};

export default HTTPSource;
