import React, { type FC } from 'react';
import classNames from 'classnames';

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

import useUploadPVCForm from '../hooks/useUploadPVCForm';
import useUploadPVCResources from '../hooks/useUploadPVCResources';
import { CDI_UPLOAD_OS_URL_PARAM } from '../utils/consts';
import { getName } from '../utils/selectors';
import UploadPVCButtonBar from './UploadPVCButtonBar';
import UploadPVCForm from './UploadPVCForm';
import UploadPVCFormStatus from './UploadPVCFormStatus';

import '@kubevirt-utils/styles/forms.scss';

const UploadPVCPage: FC = () => {
  const { t } = useKubevirtTranslation();

  const {
    allowedTemplates,
    errorPvcs,
    errorTemplates,
    goldenPvcs,
    loadedPvcs,
    loadedTemplates,
    namespaceParam,
    rbacLoading,
    readyStorageClasses,
    scLoaded,
    uploadContext,
  } = useUploadPVCResources();

  const {
    disableFormSubmit,
    dvObj,
    error,
    fileName,
    fileNameExtText,
    fileValue,
    handleFileChange,
    handleFileNameChange,
    isAllocating,
    isCheckingCertificate,
    isFileRejected,
    isSubmitting,
    namespace,
    onCancel,
    onErrorClick,
    onSuccessClick,
    save,
    setDisableFormSubmit,
    setDvObj,
    setIsFileRejected,
  } = useUploadPVCForm({ errorPvcs, errorTemplates, namespaceParam, uploadContext }, t);

  const urlParams = new URLSearchParams(window.location.search);
  const osParam = urlParams.get(CDI_UPLOAD_OS_URL_PARAM);
  const title = t('Upload data to PersistentVolumeClaim');

  return (
    <>
      <DocumentTitle>{title}</DocumentTitle>
      <PageSection
        className={classNames('kv-m-pane__form', {
          'kv--create-upload__hide': isSubmitting,
        })}
        hasBodyWrapper={false}
      >
        <Title headingLevel="h1">{title}</Title>
        <Form onSubmit={save}>
          <UploadPVCForm
            commonTemplates={allowedTemplates}
            fileName={fileName}
            fileValue={fileValue}
            goldenPvcs={goldenPvcs}
            handleFileChange={handleFileChange}
            handleFileNameChange={handleFileNameChange}
            isLoading={!loadedTemplates}
            ns={namespaceParam}
            onChange={setDvObj}
            osParam={osParam}
            setDisableFormSubmit={setDisableFormSubmit}
            setIsFileRejected={setIsFileRejected}
            storageClasses={readyStorageClasses}
          />
          <UploadPVCButtonBar
            errorMessage={error}
            inProgress={
              rbacLoading || !scLoaded || !loadedTemplates || !loadedPvcs || isCheckingCertificate
            }
            uploadProxyURL={uploadContext.uploadProxyURL}
          >
            {isFileRejected && (
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
                isDisabled={disableFormSubmit || isCheckingCertificate}
                type="submit"
              >
                {t('Upload')}
              </Button>
              <Button onClick={onCancel} type="button" variant={ButtonVariant.secondary}>
                {t('Cancel')}
              </Button>
            </ActionGroup>
          </UploadPVCButtonBar>
        </Form>
      </PageSection>
      <UploadPVCFormStatus
        allocateError={error}
        dataVolume={dvObj}
        isAllocating={isAllocating}
        isSubmitting={isSubmitting}
        onCancelClick={onCancel}
        onErrorClick={onErrorClick}
        onSuccessClick={onSuccessClick}
        upload={uploadContext.uploads?.find(
          (upl) => upl?.pvcName === getName(dvObj) && upl?.namespace === namespace,
        )}
      />
    </>
  );
};

export default UploadPVCPage;
