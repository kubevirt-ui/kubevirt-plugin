import React, { type FC } from 'react';
import { useNavigate } from 'react-router';
import classNames from 'classnames';

import { PersistentVolumeClaimModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DocumentTitle } from '@openshift-console/dynamic-plugin-sdk';
import {
  ActionGroup,
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Form,
  PageSection,
  Title,
} from '@patternfly/react-core';

import { resourcePath } from '../utils/resourceUtils';
import { getName } from '../utils/selectors';
import UploadPVCButtonBar from './UploadPVCButtonBar';
import UploadPVCForm from './UploadPVCForm';
import UploadPVCFormStatus from './UploadPVCFormStatus';
import { useUploadPVCState } from './useUploadPVCState';

import '@kubevirt-utils/styles/forms.scss';

const UploadPVCPage: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const state = useUploadPVCState();
  const title = t('Upload data to PersistentVolumeClaim');
  const fileNameExtText = state.fileNameExtension
    ? t('Detected file extension is {{fileNameExtension}}', {
        fileNameExtension: state.fileNameExtension,
      })
    : t('No file extension detected');

  return (
    <>
      <DocumentTitle>{title}</DocumentTitle>
      <PageSection
        className={classNames('kv-m-pane__form', { 'kv--create-upload__hide': state.isSubmitting })}
        hasBodyWrapper={false}
      >
        <Title headingLevel="h1">{title}</Title>
        <Form onSubmit={state.save}>
          <UploadPVCForm
            commonTemplates={state.allowedTemplates}
            fileName={state.fileName}
            fileValue={state.fileValue}
            goldenPvcs={state.goldenPvcs}
            handleFileChange={state.handleFileChange}
            handleFileNameChange={state.handleFileNameChange}
            isLoading={!state.loadedTemplates}
            ns={state.namespaceParam}
            onChange={state.setDvObj}
            osParam={state.osParam}
            setDisableFormSubmit={state.setDisableFormSubmit}
            setIsFileRejected={state.setIsFileRejected}
            storageClasses={state.readyStorageClasses}
          />
          <UploadPVCButtonBar
            errorMessage={state.error}
            inProgress={
              state.rbacLoading ||
              !state.scLoaded ||
              !state.loadedTemplates ||
              !state.loadedPvcs ||
              state.isCheckingCertificate
            }
            uploadProxyURL={state.uploadProxyURL}
          >
            {state.isFileRejected && (
              <Alert isInline title={t('File type extension')} variant={AlertVariant.warning}>
                <p>
                  {t(
                    'Based on the file extension it seems like you are trying to upload a file which is not supported ({{fileNameExtText}}).',
                    { fileNameExtText },
                  )}
                </p>
                <p>
                  <ExternalLink
                    href={documentationURL.CDI_UPLOAD_SUPPORTED_TYPES}
                    text={t('Learn more about supported formats')}
                  />
                </p>
              </Alert>
            )}
            <ActionGroup>
              <Button
                id="save-changes"
                isDisabled={state.disableFormSubmit || state.isCheckingCertificate}
                type="submit"
              >
                {t('Upload')}
              </Button>
              <Button onClick={state.onCancel} type="button" variant={ButtonVariant.secondary}>
                {t('Cancel')}
              </Button>
            </ActionGroup>
          </UploadPVCButtonBar>
        </Form>
      </PageSection>
      <UploadPVCFormStatus
        allocateError={state.error}
        dataVolume={state.dvObj}
        isAllocating={state.isAllocating}
        isSubmitting={state.isSubmitting}
        onCancelClick={state.onCancel}
        onErrorClick={() => {
          state.setIsSubmitting(false);
          state.setError('');
        }}
        onSuccessClick={() =>
          navigate(resourcePath(PersistentVolumeClaimModel, getName(state.dvObj), state.namespace))
        }
        upload={state.uploads?.find(
          (upl) => upl?.pvcName === getName(state.dvObj) && upl?.namespace === state.namespace,
        )}
      />
    </>
  );
};

export default UploadPVCPage;
