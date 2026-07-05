import React, { type FC, useEffect, useRef, useState } from 'react';
import { Trans } from 'react-i18next';

import {
  modelToGroupVersionKind,
  TemplateModel,
  type V1Template,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1DataSource,
  type V1beta1DataVolumeSpec,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type K8sResourceCommon, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  Popover,
} from '@patternfly/react-core';

import { editBootSource } from '../editBootSource';

import { SOURCE_TYPES } from '../../utils/constants';
import useBootSourceEditAffectedTemplates from './hooks/useBootSourceEditAffectedTemplates';
import { SelectSource } from './SelectSource';
import SelectSourceSkeleton from './SelectSourceSkeleton';
import { getDataVolumeSpec } from './utils';

import './EditBootSourceModal.scss';

type EditBootSourceModalProps = {
  dataSource: V1beta1DataSource;
  isOpen: boolean;
  obj: V1Template;
  onClose: () => void;
};

const EditBootSourceModal: FC<EditBootSourceModalProps> = ({
  dataSource,
  isOpen,
  obj,
  onClose,
}) => {
  const { t } = useKubevirtTranslation();
  const [bootSource, setBootSource] = useState<V1beta1DataVolumeSpec>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getDataVolumeSpec(dataSource)
      .then(setBootSource)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dataSource]);

  const affectedTemplates = useBootSourceEditAffectedTemplates(obj);

  const onSubmit = async (): Promise<void> => {
    await editBootSource(dataSource, bootSource);
  };

  const popoverRef = useRef<HTMLButtonElement>(null);

  return (
    <TabModal<K8sResourceCommon>
      headerText={t('Edit boot source reference')}
      isOpen={isOpen}
      obj={obj}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Alert
        className="margin-bottom-md"
        isInline
        title={t('Warning')}
        variant={AlertVariant.warning}
      >
        <Trans ns="plugin__kubevirt-plugin">
          Editing the DataSource will affect{' '}
          <Button isInline ref={popoverRef} variant={ButtonVariant.link}>
            all templates
          </Button>{' '}
          that are currently using this DataSource.
        </Trans>
      </Alert>
      <Popover
        bodyContent={(affectedTemplates || []).map((template) => (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(TemplateModel)}
            key={template.metadata.uid}
            linkTo={false}
            name={template.metadata.name}
            namespace={template.metadata.namespace}
          />
        ))}
        headerContent={t('Affected templates')}
        triggerRef={popoverRef}
      />

      <Form>
        <FormGroup fieldId="boot-source-type" isRequired>
          {loading ? (
            <SelectSourceSkeleton />
          ) : (
            <SelectSource
              onSourceChange={setBootSource}
              source={bootSource}
              sourceLabel={t('Boot source type')}
              sourceOptions={[
                SOURCE_TYPES.pvcSource,
                SOURCE_TYPES.registrySource,
                SOURCE_TYPES.httpSource,
              ]}
              withSize
            />
          )}
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default EditBootSourceModal;
