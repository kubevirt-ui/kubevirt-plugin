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
  isOpen: boolean;
  obj: V1Template;
  dataSource: V1beta1DataSource;
  onClose: () => void;
};

const EditBootSourceModal: FC<EditBootSourceModalProps> = ({
  isOpen,
  obj,
  dataSource,
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

  return (
    <>
      <TabModal<K8sResourceCommon>
        obj={obj}
        headerText={t('Edit boot source reference')}
        onSubmit={onSubmit}
        isOpen={isOpen}
        onClose={onClose}
      >
        <Alert isInline className="margin-bottom-md" variant="warning" title={t('Warning')}>
          <Trans ns="plugin__kubevirt-plugin">
            Editing the DataSource will affect{' '}
            <Popover
              headerContent={t('Affected templates')}
              bodyContent={(affectedTemplates || []).map((template) => (
                <ResourceLink
                  key={template.metadata.uid}
                  groupVersionKind={modelToGroupVersionKind(TemplateModel)}
                  name={template.metadata.name}
                  namespace={template.metadata.namespace}
                  linkTo={false}
                />
              ))}
            >
              <Button variant="link" isInline>
                {' '}
                all templates
              </Button>
            </Popover>{' '}
            that are currently using this DataSource.
          </Trans>
        </Alert>

        <Form>
          <FormGroup fieldId="boot-source-type" isRequired>
            {loading ? (
              <SelectSourceSkeleton />
            ) : (
              <SelectSource
                source={bootSource}
                onSourceChange={setBootSource}
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
    </>
  );
};

export default EditBootSourceModal;
