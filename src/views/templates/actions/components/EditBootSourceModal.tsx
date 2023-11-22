import React, { FC, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';

import {
  modelToGroupVersionKind,
  TemplateModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1beta1DataVolumeSpec } from '@kubevirt-ui/kubevirt-api/kubevirt';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Button, Form, FormGroup, Popover } from '@patternfly/react-core';

import { SOURCE_TYPES } from '../../utils/constants';
import { editBootSource } from '../editBootSource';

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
      .finally(() => setLoading(false));
  }, [dataSource]);

  const affectedTemplates = useBootSourceEditAffectedTemplates(obj);

  const onSubmit = async () => {
    await editBootSource(dataSource, bootSource);
  };

  const popoverRef = React.useRef<HTMLButtonElement>(null);

  return (
    <>
      <TabModal<K8sResourceCommon>
        headerText={t('Edit boot source reference')}
        isOpen={isOpen}
        obj={obj}
        onClose={onClose}
        onSubmit={onSubmit}
      >
        <Alert className="margin-bottom-md" isInline title={t('Warning')} variant="warning">
          <Trans ns="plugin__kubevirt-plugin">
            Editing the DataSource will affect{' '}
            <Button isInline ref={popoverRef} variant="link">
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
          reference={popoverRef}
        />

        <Form>
          <FormGroup fieldId="boot-source-type" isRequired>
            {loading ? (
              <SelectSourceSkeleton />
            ) : (
              <SelectSource
                sourceOptions={[
                  SOURCE_TYPES.pvcSource,
                  SOURCE_TYPES.registrySource,
                  SOURCE_TYPES.httpSource,
                ]}
                onSourceChange={setBootSource}
                source={bootSource}
                sourceLabel={t('Boot source type')}
                withSize
              />
            )}
          </FormGroup>
        </Form>
      </TabModal>
    </>
  );
};

export default EditBootSourceModal;
