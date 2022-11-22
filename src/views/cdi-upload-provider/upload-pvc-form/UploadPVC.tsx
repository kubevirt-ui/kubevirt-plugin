import React, { FC, FormEvent, useContext, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { match, useHistory } from 'react-router-dom';
import axios from 'axios';
import cx from 'classnames';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  StorageClassModel,
  TemplateModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui/kubevirt-api/kubernetes';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { createUploadPVC } from '@kubevirt-utils/hooks/useCDIUpload/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  TEMPLATE_TYPE_BASE,
  TEMPLATE_TYPE_LABEL,
  TEMPLATE_VM_COMMON_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import {
  K8sVerb,
  useAccessReview,
  useK8sWatchResource,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { ActionGroup, Alert, Button, ButtonVariant } from '@patternfly/react-core';

import useBaseImages from '../hooks/useBaseImages';
import useMultipleAccessReviews from '../hooks/useMultipleAccessReviews';
import {
  CDI_UPLOAD_OS_URL_PARAM,
  CDI_UPLOAD_SUPPORTED_TYPES_URL,
  CDI_UPLOAD_URL_BUILDER,
  uploadErrorType,
} from '../utils/consts';
import { CDIUploadContext } from '../utils/context';
import { getName, getNamespace, getPVCNamespace } from '../utils/selectors';
import { resourcePath } from '../utils/utils';

import UploadPVCButtonBar from './UploadPVCButtonBar';
import UploadPVCForm from './UploadPVCForm';
import UploadPVCFormStatus from './UploadPVCFormStatus';

type UploadPVCPageProps = {
  match: match<{ ns?: string }>;
};

const templatesResource: WatchK8sResource = {
  isList: true,
  optional: true,
  groupVersionKind: modelToGroupVersionKind(TemplateModel),
  namespace: TEMPLATE_VM_COMMON_NAMESPACE,
  selector: {
    matchLabels: { [TEMPLATE_TYPE_LABEL]: TEMPLATE_TYPE_BASE },
  },
};
const UploadPVCPage: FC<UploadPVCPageProps> = (props) => {
  const { t } = useKubevirtTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingCertificate, setCheckingCertificate] = useState(false);
  const [disableFormSubmit, setDisableFormSubmit] = useState(false);
  const [fileValue, setFileValue] = useState<File>(null);
  const [fileName, setFileName] = useState('');
  const [fileNameExtension, setFileNameExtension] = useState('');
  const [isFileRejected, setIsFileRejected] = useState(false);
  const [error, setError] = useState<string>('');
  const [isAllocating, setIsAllocating] = useState(false);
  const [dvObj, setDvObj] = useState<V1beta1DataVolume>(null);
  const [commonTemplates, loadedTemplates, errorTemplates] =
    useK8sWatchResource<V1Template[]>(templatesResource);
  const history = useHistory();
  const goldenNamespacesResources = useMemo(() => {
    const goldenNamespaces = [
      ...new Set(
        (commonTemplates || []).map((template) => getPVCNamespace(template)).filter((ns) => !!ns),
      ),
    ];

    return goldenNamespaces.map((ns) => ({
      group: DataVolumeModel.apiGroup,
      resource: DataVolumeModel.plural,
      verb: 'create' as K8sVerb,
      namespace: ns,
    }));
  }, [commonTemplates]);

  const [goldenAccessReviews, rbacLoading] = useMultipleAccessReviews(
    goldenNamespacesResources,
    null,
  );
  const allowedTemplates = commonTemplates.filter((tmp) =>
    goldenAccessReviews.some(
      (accessReview) =>
        accessReview.allowed && accessReview.resourceAttributes.namespace === getPVCNamespace(tmp),
    ),
  );

  const [goldenPvcs, loadedPvcs, errorPvcs] = useBaseImages(allowedTemplates);
  const { uploads, uploadData, uploadProxyURL } = useContext(CDIUploadContext);
  const [scAllowed, scAllowedLoading] = useAccessReview({
    group: StorageClassModel.apiGroup,
    resource: StorageClassModel.plural,
    verb: 'list',
  });
  const [storageClasses, scLoaded] = useK8sWatchResource<IoK8sApiStorageV1StorageClass[]>(
    scAllowed
      ? {
          groupVersionKind: modelToGroupVersionKind(StorageClassModel),
          isList: true,
          namespaced: false,
        }
      : null,
  );

  const initialNamespace = props?.match?.params?.ns;
  const namespace = getNamespace(dvObj) || initialNamespace;
  const urlParams = new URLSearchParams(window.location.search);
  const osParam = urlParams.get(CDI_UPLOAD_OS_URL_PARAM);
  const title = t('Upload data to Persistent Volume Claim');
  const fileNameExtText = fileNameExtension
    ? t('Detected file extension is {{fileNameExtension}}', { fileNameExtension })
    : t('No file extension detected');

  const save = (e: FormEvent<EventTarget>) => {
    e.preventDefault();
    if (!fileName) {
      setError(uploadErrorType.MISSING);
    } else {
      // checking valid certificate for proxy
      setCheckingCertificate(true);
      axios
        .get(CDI_UPLOAD_URL_BUILDER(uploadProxyURL))
        .catch((catchError) => {
          setCheckingCertificate(false);
          // the GET request will return an error everytime, but it will be undefined only if the certificate is invalid.
          if (catchError?.response?.data === undefined) {
            throw new Error(uploadErrorType.CERT);
          }
        })
        .then(() => {
          setError('');
          setIsAllocating(true);
          setIsSubmitting(true);
          return createUploadPVC(dvObj);
        })
        .then(({ token }) => {
          setIsAllocating(false);
          uploadData({
            file: fileValue,
            token,
            pvcName: getName(dvObj),
            namespace,
          });
        })
        .catch((err) => {
          setIsAllocating(false);
          setError(err?.message || uploadErrorType.ALLOCATE);
        });
    }
  };

  const handleFileChange = (value, filename) => {
    setFileName(filename);
    setFileValue(value);

    setFileNameExtension(/[.][^.]+$/.exec(filename)?.toString());
    setIsFileRejected(false);
    setError('');
  };

  useEffect(() => {
    if (errorTemplates || errorPvcs) {
      setError(errorTemplates?.message || errorPvcs?.message);
    }
  }, [errorTemplates, errorPvcs]);

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div
        className={cx('co-m-pane__body co-m-pane__form', {
          'kv--create-upload__hide': isSubmitting,
        })}
      >
        <h1 className="co-m-pane__heading co-m-pane__heading--baseline">
          <div className="co-m-pane__name">{title}</div>
        </h1>
        <form className="co-m-pane__body-group" onSubmit={save}>
          <UploadPVCForm
            onChange={setDvObj}
            ns={initialNamespace}
            fileValue={fileValue}
            fileName={fileName}
            handleFileChange={handleFileChange}
            setIsFileRejected={setIsFileRejected}
            commonTemplates={allowedTemplates}
            goldenPvcs={goldenPvcs}
            osParam={osParam}
            isLoading={!loadedTemplates}
            setDisableFormSubmit={setDisableFormSubmit}
            storageClasses={storageClasses}
          />
          <UploadPVCButtonBar
            inProgress={
              rbacLoading ||
              scAllowedLoading ||
              !scLoaded ||
              !loadedTemplates ||
              !loadedPvcs ||
              isCheckingCertificate
            }
            uploadProxyURL={uploadProxyURL}
            errorMessage={error}
          >
            {isFileRejected && (
              <Alert variant="warning" isInline title={t('File type extension')}>
                <p>
                  {t(
                    'Based on the file extension it seems like you are trying to upload a file which is not supported ({{fileNameExtText}}).',
                    { fileNameExtText },
                  )}
                </p>
                <p>
                  <ExternalLink
                    text={t('Learn more about supported formats')}
                    href={CDI_UPLOAD_SUPPORTED_TYPES_URL}
                  />
                </p>
              </Alert>
            )}
            <ActionGroup className="pf-c-form">
              <Button
                isDisabled={disableFormSubmit || isCheckingCertificate}
                id="save-changes"
                type="submit"
                variant={ButtonVariant.primary}
              >
                {t('Upload')}
              </Button>
              <Button onClick={history.goBack} type="button" variant="secondary">
                {t('Cancel')}
              </Button>
            </ActionGroup>
          </UploadPVCButtonBar>
        </form>
      </div>
      <UploadPVCFormStatus
        upload={uploads?.find(
          (upl) => upl?.pvcName === getName(dvObj) && upl?.namespace === namespace,
        )}
        dataVolume={dvObj}
        isSubmitting={isSubmitting}
        isAllocating={isAllocating}
        allocateError={error}
        onErrorClick={() => {
          setIsSubmitting(false);
          setError('');
        }}
        onSuccessClick={() =>
          history.push(resourcePath(PersistentVolumeClaimModel, getName(dvObj), namespace))
        }
        onCancelClick={() => history.push(resourcePath(PersistentVolumeClaimModel))}
      />
    </>
  );
};

export default UploadPVCPage;
